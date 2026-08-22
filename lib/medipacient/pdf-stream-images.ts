import { inflateSync } from "node:zlib";
import { encodePngGrayscale, encodePngRgb } from "@/lib/medipacient/png-encode";

export type PdfStreamImage = { buffer: Buffer; mime: "image/jpeg" | "image/png"; width?: number; height?: number };

function looksLikeJpeg(bytes: Buffer): boolean {
  return bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8;
}

function looksLikePng(bytes: Buffer): boolean {
  return bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}

function inflatePdfBytes(bytes: Buffer): Buffer | null {
  try {
    return inflateSync(bytes);
  } catch {
    try {
      return inflateSync(bytes.subarray(2));
    } catch {
      return null;
    }
  }
}

function dictInt(header: string, key: string): number | null {
  const match = header.match(new RegExp(`/${key}\\s+(\\d+)`));
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

/**
 * Pull page images from PDF streams without bundling pdf.js (Worker 10 MiB cap).
 * Handles DCTDecode JPEGs and FlateDecode image XObjects / wrapped JPEG-PNG.
 */
export async function extractPdfStreamImages(buffer: Buffer): Promise<PdfStreamImage[]> {
  const out: PdfStreamImage[] = [];
  const ascii = buffer.toString("latin1");
  const re = /(?:^|[\r\n])stream\r?\n/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(ascii))) {
    const headerStart = Math.max(0, match.index - 900);
    const header = ascii.slice(headerStart, match.index);
    const dataStart = match.index + match[0].length;
    const end = ascii.indexOf("endstream", dataStart);
    if (end < 0) continue;
    let raw = buffer.subarray(dataStart, end);
    if (raw.length >= 2 && raw[raw.length - 1] === 0x0a) raw = raw.subarray(0, raw.length - 1);
    if (raw.length >= 1 && raw[raw.length - 1] === 0x0d) raw = raw.subarray(0, raw.length - 1);
    const dct = /\/DCTDecode\b/.test(header);
    const flate = /\/FlateDecode\b/.test(header);
    const width = dictInt(header, "Width");
    const height = dictInt(header, "Height");
    const isImage = /\/Subtype\s*\/Image\b/.test(header) || Boolean(width && height && (dct || flate));
    const large = Boolean(width && height && width >= 400 && height >= 400) || raw.length >= 40_000;
    const candidates: Buffer[] = [];
    if (dct) candidates.push(Buffer.from(raw));
    if (flate) {
      const inflated = inflatePdfBytes(Buffer.from(raw));
      if (inflated) candidates.push(inflated);
    }
    if (!dct && !flate && raw.length >= 8_000) candidates.push(Buffer.from(raw));
    for (const candidate of candidates) {
      if (looksLikeJpeg(candidate) && (large || candidate.length >= 24_000)) {
        out.push({ buffer: candidate, mime: "image/jpeg", width: width ?? undefined, height: height ?? undefined });
        break;
      }
      if (looksLikePng(candidate) && (large || candidate.length >= 24_000)) {
        out.push({ buffer: candidate, mime: "image/png", width: width ?? undefined, height: height ?? undefined });
        break;
      }
      if (isImage && large && width && height && flate) {
        const gray = width * height;
        const rgb = gray * 3;
        if (candidate.length >= gray && candidate.length < rgb + width) {
          out.push({
            buffer: await encodePngGrayscale(Uint8Array.from(candidate.subarray(0, gray)), width, height),
            mime: "image/png",
            width,
            height,
          });
          break;
        }
        if (candidate.length >= rgb) {
          out.push({
            buffer: await encodePngRgb(Uint8Array.from(candidate.subarray(0, rgb)), width, height),
            mime: "image/png",
            width,
            height,
          });
          break;
        }
      }
    }
    if (out.length >= 8) break;
  }
  return out;
}
