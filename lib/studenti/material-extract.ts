import { DocumentExtractError } from "@/lib/doc/extract";

export type ExtractedMaterialBody = {
  kind: "text" | "html";
  content: string;
};

function normalizeExtractedText(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function extractDocText(buffer: Buffer): Promise<string> {
  const WordExtractor = (await import("word-extractor")).default;
  const extractor = new WordExtractor();
  const extracted = await extractor.extract(buffer);
  const parts = [
    extracted.getBody(),
    extracted.getHeaders(),
    extracted.getFootnotes(),
    extracted.getEndnotes(),
  ]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean);

  const text = normalizeExtractedText(parts.join("\n\n"));
  if (!text) {
    throw new DocumentExtractError("No text extracted from document", "extract_failed");
  }
  return text;
}

export function extractRtfText(buffer: Buffer): string {
  let rtf = buffer.toString("latin1");
  rtf = rtf.replace(/\\'([0-9a-f]{2})/gi, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16))
  );
  rtf = rtf.replace(/\\par[d]?/gi, "\n");
  rtf = rtf.replace(/\\tab/gi, "\t");
  rtf = rtf.replace(/\\[a-z]+(-?\d+)?[ ]?/gi, "");
  rtf = rtf.replace(/[{}]/g, "");
  rtf = rtf.replace(/\\([\\{}])/g, "$1");

  const text = normalizeExtractedText(rtf);
  if (!text) {
    throw new DocumentExtractError("No text extracted from document", "extract_failed");
  }
  return text;
}

export async function listZipArchive(buffer: Buffer): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);
  const names = Object.keys(zip.files)
    .filter((name) => !zip.files[name].dir)
    .sort((a, b) => a.localeCompare(b, "cs"));

  if (names.length === 0) {
    return "Archiv ZIP neobsahuje žádné soubory.";
  }

  const lines = names.map((name) => `• ${name}`);
  return normalizeExtractedText(
    `Obsah archivu ZIP (${names.length} ${names.length === 1 ? "soubor" : names.length < 5 ? "soubory" : "souborů"}):\n\n${lines.join("\n")}`
  );
}

/** Best-effort archive filename listing from binary scan (no decompression). */
export function listRarArchive(buffer: Buffer): string {
  const names = new Set<string>();
  const latin = buffer.toString("latin1");
  const re =
    /[\w\u0080-\u024F][\w\u0080-\u024F\s.\-_()]{0,120}\.(pdf|doc|docx|ppt|pptx|txt|rtf|zip|rar|7z|jpg|png|xls|xlsx|bmp|gif)/gi;

  for (const match of latin.matchAll(re)) {
    names.add(match[0].trim());
  }

  const unique = [...names].sort((a, b) => a.localeCompare(b, "cs"));
  if (unique.length === 0) {
    return "Archiv — seznam souborů se nepodařilo načíst. Stáhněte archiv pro plný obsah.";
  }

  const lines = unique.map((name) => `• ${name}`);
  return normalizeExtractedText(
    `Obsah archivu (${unique.length} ${unique.length === 1 ? "soubor" : unique.length < 5 ? "soubory" : "souborů"}):\n\n${lines.join("\n")}`
  );
}

export async function extractPptText(buffer: Buffer): Promise<string> {
  // Legacy PPT (OLE) — extract readable ASCII/UTF-16LE strings as fallback.
  const chunks: string[] = [];
  const utf16 = buffer.toString("utf16le");
  const utf16Matches = utf16.match(/[\p{L}\p{N}][\p{L}\p{N}\s.,;:!?\-–—()[\]/]{8,}/gu);
  if (utf16Matches) chunks.push(...utf16Matches);

  const latin = buffer.toString("latin1");
  const latinMatches = latin.match(/[A-Za-zÁ-Žá-ž0-9][A-Za-zÁ-Žá-ž0-9\s.,;:!?\-–—()[\]/]{8,}/g);
  if (latinMatches) chunks.push(...latinMatches);

  const deduped = [...new Set(chunks.map((c) => c.trim()))]
    .filter((c) => c.length >= 12 && !/^Microsoft PowerPoint/i.test(c))
    .slice(0, 200);

  if (deduped.length === 0) {
    throw new DocumentExtractError("No text extracted from document", "extract_failed");
  }

  return normalizeExtractedText(deduped.join("\n\n"));
}
