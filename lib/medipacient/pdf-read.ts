import { extractImages, extractText, getDocumentProxy, getResolvedPDFJS } from "unpdf";

import { encodePngGrayscale, encodePngRgb } from "@/lib/medipacient/png-encode";

export const MAX_PDF_PAGES = 8;
const MAX_IMAGE_PX = 16_777_216;
const TARGET_SCALE = 2;
const MAX_SIDE = 1800;

type Matrix = [number, number, number, number, number, number];
type Point = { x: number; y: number };
type PageImage = { data: Uint8ClampedArray; width: number; height: number; channels: 1 | 3 | 4; key: string };

const DRAW_OPS = {
  moveTo: 0,
  lineTo: 1,
  curveTo: 2,
  quadraticCurveTo: 3,
  closePath: 4,
} as const;

export type RasterPage = {
  page: number;
  width: number;
  height: number;
  png: Buffer;
  mime: "image/png";
  inkRatio: number;
};

function multiply(a: Matrix, b: Matrix): Matrix {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

function apply(m: Matrix, x: number, y: number): Point {
  return { x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5] };
}

function invert(m: Matrix): Matrix | null {
  const det = m[0] * m[3] - m[1] * m[2];
  if (Math.abs(det) < 1e-12) return null;
  const invDet = 1 / det;
  return [
    m[3] * invDet,
    -m[1] * invDet,
    -m[2] * invDet,
    m[0] * invDet,
    (m[2] * m[5] - m[3] * m[4]) * invDet,
    (m[1] * m[4] - m[0] * m[5]) * invDet,
  ];
}

function flattenCubic(p0: Point, p1: Point, p2: Point, p3: Point, out: Point[], depth = 0) {
  const dx = p3.x - p0.x;
  const dy = p3.y - p0.y;
  const d1 = Math.abs((p1.x - p3.x) * dy - (p1.y - p3.y) * dx);
  const d2 = Math.abs((p2.x - p3.x) * dy - (p2.y - p3.y) * dx);
  if (d1 + d2 < 0.7 || depth >= 6) {
    out.push(p3);
    return;
  }
  const a = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
  const b = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  const c = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
  const d = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const e = { x: (b.x + c.x) / 2, y: (b.y + c.y) / 2 };
  const f = { x: (d.x + e.x) / 2, y: (d.y + e.y) / 2 };
  flattenCubic(p0, a, d, f, out, depth + 1);
  flattenCubic(f, e, c, p3, out, depth + 1);
}

export function parsePackedPath(data: ArrayLike<number>, ctm: Matrix): Point[][] {
  const subpaths: Point[][] = [];
  let current: Point[] = [];
  let i = 0;
  const n = data.length;
  while (i < n) {
    const op = data[i++] | 0;
    if (op === DRAW_OPS.moveTo && i + 1 < n) {
      if (current.length) subpaths.push(current);
      current = [apply(ctm, data[i], data[i + 1])];
      i += 2;
    } else if (op === DRAW_OPS.lineTo && i + 1 < n) {
      if (!current.length) current = [apply(ctm, data[i], data[i + 1])];
      else current.push(apply(ctm, data[i], data[i + 1]));
      i += 2;
    } else if (op === DRAW_OPS.curveTo && i + 5 < n) {
      const p0 = current[current.length - 1] || apply(ctm, 0, 0);
      const p1 = apply(ctm, data[i], data[i + 1]);
      const p2 = apply(ctm, data[i + 2], data[i + 3]);
      const p3 = apply(ctm, data[i + 4], data[i + 5]);
      flattenCubic(p0, p1, p2, p3, current);
      i += 6;
    } else if (op === DRAW_OPS.quadraticCurveTo && i + 3 < n) {
      const p0 = current[current.length - 1] || apply(ctm, 0, 0);
      const c1 = apply(ctm, data[i], data[i + 1]);
      const p3 = apply(ctm, data[i + 2], data[i + 3]);
      const p1 = { x: p0.x + (2 / 3) * (c1.x - p0.x), y: p0.y + (2 / 3) * (c1.y - p0.y) };
      const p2 = { x: p3.x + (2 / 3) * (c1.x - p3.x), y: p3.y + (2 / 3) * (c1.y - p3.y) };
      flattenCubic(p0, p1, p2, p3, current);
      i += 4;
    } else if (op === DRAW_OPS.closePath) {
      if (current.length) {
        const first = current[0];
        const last = current[current.length - 1];
        if (first.x !== last.x || first.y !== last.y) current.push({ ...first });
        subpaths.push(current);
        current = [];
      }
    } else {
      break;
    }
  }
  if (current.length) subpaths.push(current);
  return subpaths;
}

function sampleLuma(img: PageImage, x: number, y: number): number {
  const ix = Math.max(0, Math.min(img.width - 1, x | 0));
  const iy = Math.max(0, Math.min(img.height - 1, y | 0));
  const i = (iy * img.width + ix) * img.channels;
  if (img.channels === 1) return img.data[i];
  const r = img.data[i];
  const g = img.data[i + 1];
  const b = img.data[i + 2];
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

export function fillPolygonGray(
  pixels: Uint8Array,
  width: number,
  height: number,
  contours: Point[][],
  color: number,
  _evenOdd: boolean,
): void {
  const points = contours.flat();
  if (points.length < 3) return;
  let minY = height;
  let maxY = 0;
  for (const p of points) {
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const y0 = Math.max(0, Math.floor(minY));
  const y1 = Math.min(height - 1, Math.ceil(maxY));
  const gray = color < 0 ? 0 : color > 255 ? 255 : color | 0;
  for (let y = y0; y <= y1; y++) {
    const scan = y + 0.5;
    const xs: number[] = [];
    for (const contour of contours) {
      for (let i = 0; i < contour.length; i++) {
        const a = contour[i];
        const b = contour[(i + 1) % contour.length];
        if ((a.y <= scan && b.y > scan) || (b.y <= scan && a.y > scan)) {
          const t = (scan - a.y) / (b.y - a.y);
          xs.push(a.x + t * (b.x - a.x));
        }
      }
    }
    if (xs.length < 2) continue;
    xs.sort((p, q) => p - q);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const left = Math.max(0, Math.ceil(xs[i]));
      const right = Math.min(width - 1, Math.floor(xs[i + 1]));
      const row = y * width;
      for (let x = left; x <= right; x++) pixels[row + x] = gray;
    }
  }
}

function blitImage(
  pixels: Uint8Array,
  width: number,
  height: number,
  img: PageImage,
  ctm: Matrix,
): void {
  const corners = [apply(ctm, 0, 0), apply(ctm, 1, 0), apply(ctm, 1, 1), apply(ctm, 0, 1)];
  const minX = Math.max(0, Math.floor(Math.min(...corners.map((p) => p.x))));
  const maxX = Math.min(width - 1, Math.ceil(Math.max(...corners.map((p) => p.x))));
  const minY = Math.max(0, Math.floor(Math.min(...corners.map((p) => p.y))));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(...corners.map((p) => p.y))));
  const inv = invert(ctm);
  if (!inv || maxX < minX || maxY < minY) return;
  for (let y = minY; y <= maxY; y++) {
    const row = y * width;
    for (let x = minX; x <= maxX; x++) {
      const src = apply(inv, x + 0.5, y + 0.5);
      if (src.x < 0 || src.y < 0 || src.x > 1 || src.y > 1) continue;
      pixels[row + x] = sampleLuma(img, src.x * img.width, (1 - src.y) * img.height);
    }
  }
}

function parseFillGray(args: unknown): number {
  if (Array.isArray(args) && typeof args[0] === "string" && args[0].startsWith("#")) {
    const hex = args[0].slice(1);
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    const n = Number.parseInt(full, 16);
    if (Number.isFinite(n)) {
      const r = (n >> 16) & 255;
      const g = (n >> 8) & 255;
      const b = n & 255;
      return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
  }
  if (Array.isArray(args) && args.length >= 3) {
    const to8 = (v: unknown) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return 0;
      return n <= 1 ? Math.round(n * 255) : Math.round(n);
    };
    return Math.round(0.299 * to8(args[0]) + 0.587 * to8(args[1]) + 0.114 * to8(args[2]));
  }
  return 0;
}

export function stretchContrast(pixels: Uint8Array): void {
  let min = 255;
  let max = 0;
  for (let i = 0; i < pixels.length; i++) {
    const v = pixels[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (max - min < 24) return;
  const scale = 255 / (max - min);
  for (let i = 0; i < pixels.length; i++) {
    pixels[i] = Math.max(0, Math.min(255, Math.round((pixels[i] - min) * scale)));
  }
}

function inkRatio(pixels: Uint8Array): number {
  if (!pixels.length) return 0;
  let ink = 0;
  for (let i = 0; i < pixels.length; i++) if (pixels[i] < 240) ink++;
  return ink / pixels.length;
}

function releasePdf(pdf: { destroy?: () => Promise<unknown>; cleanup?: (keepLoadedFonts?: boolean) => Promise<unknown> }) {
  return Promise.resolve()
    .then(() => pdf.cleanup?.(true))
    .then(() => pdf.destroy?.())
    .catch(() => undefined);
}

async function openPdf(buffer: Buffer) {
  return getDocumentProxy(new Uint8Array(buffer), {
    maxImageSize: MAX_IMAGE_PX,
    disableFontFace: true,
    useSystemFonts: true,
  });
}

export async function extractPdfTextLayer(buffer: Buffer): Promise<{ text: string; pages: number }> {
  const pdf = await openPdf(buffer);
  try {
    const { totalPages, text } = await extractText(pdf, { mergePages: true });
    const blob = text;
    return {
      pages: totalPages,
      text: blob
        .replace(/\u0000/g, "")
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim(),
    };
  } finally {
    await releasePdf(pdf);
  }
}

export async function rasterizePdfPagesToPng(buffer: Buffer): Promise<RasterPage[]> {
  const pdf = await openPdf(buffer);
  const pdfjs = await getResolvedPDFJS();
  const names = Object.fromEntries(Object.entries(pdfjs.OPS || {}).map(([k, v]) => [Number(v), k])) as Record<
    number,
    string
  >;
  const pages = Math.min(pdf.numPages || 0, MAX_PDF_PAGES);
  const out: RasterPage[] = [];
  try {
    for (let pageNo = 1; pageNo <= pages; pageNo++) {
      const page = await pdf.getPage(pageNo);
      const viewport = page.getViewport({ scale: 1 });
      const baseW = Math.max(1, Math.round(viewport.width || 612));
      const baseH = Math.max(1, Math.round(viewport.height || 792));
      const scale = Math.min(TARGET_SCALE, MAX_SIDE / Math.max(baseW, baseH));
      const width = Math.max(1, Math.round(baseW * scale));
      const height = Math.max(1, Math.round(baseH * scale));
      const pixels = new Uint8Array(width * height).fill(255);
      const images = new Map<string, PageImage>();
      try {
        const extracted = await extractImages(pdf, pageNo);
        for (const img of extracted) images.set(img.key, img);
      } catch {
        // vector-only pages have no XObject images
      }
      const ops = (await page.getOperatorList()) as { fnArray: number[]; argsArray: unknown[] };
      const stack: Matrix[] = [];
      let ctm: Matrix = [scale, 0, 0, -scale, 0, height];
      let fill = 0;
      for (let i = 0; i < ops.fnArray.length; i++) {
        const name = names[ops.fnArray[i]] || "";
        const args = ops.argsArray[i];
        if (name === "save") {
          stack.push(ctm);
        } else if (name === "restore") {
          ctm = stack.pop() || ctm;
        } else if (name === "transform" && Array.isArray(args) && args.length >= 6) {
          const next: Matrix = [
            Number(args[0]),
            Number(args[1]),
            Number(args[2]),
            Number(args[3]),
            Number(args[4]),
            Number(args[5]),
          ];
          ctm = multiply(ctm, next);
        } else if (name === "setFillRGBColor" || name === "setFillGray") {
          fill = parseFillGray(args);
        } else if (name === "constructPath" && Array.isArray(args)) {
          const drawOp = Number(args[0]);
          const packedList = Array.isArray(args[1]) ? args[1] : [];
          const drawName = names[drawOp] || "";
          const contours: Point[][] = [];
          for (const packed of packedList) {
            if (!packed || typeof packed !== "object") continue;
            contours.push(...parsePackedPath(packed as ArrayLike<number>, ctm));
          }
          if (drawName === "fill" || drawName === "eoFill" || drawName === "fillStroke" || drawName === "eoFillStroke") {
            fillPolygonGray(pixels, width, height, contours, fill, drawName.startsWith("eo"));
          }
        } else if (name === "paintImageXObject" && Array.isArray(args)) {
          const key = String(args[0] || "");
          const img = images.get(key);
          if (img) blitImage(pixels, width, height, img, ctm);
        }
      }
      stretchContrast(pixels);
      const ratio = inkRatio(pixels);
      out.push({
        page: pageNo,
        width,
        height,
        png: await encodePngGrayscale(pixels, width, height),
        mime: "image/png",
        inkRatio: ratio,
      });
    }
  } finally {
    await releasePdf(pdf);
  }
  return out;
}

export async function pdfEmbeddedImagesToPng(buffer: Buffer): Promise<RasterPage[]> {
  const pdf = await openPdf(buffer);
  const pages = Math.min(pdf.numPages || 0, MAX_PDF_PAGES);
  const out: RasterPage[] = [];
  try {
    for (let pageNo = 1; pageNo <= pages; pageNo++) {
      const images = await extractImages(pdf, pageNo);
      const usable = images
        .filter((img) => img.width >= 400 && img.height >= 400)
        .sort((a, b) => b.width * b.height - a.width * a.height)
        .slice(0, 2);
      for (const img of usable) {
        let png: Buffer;
        if (img.channels === 1) {
          png = await encodePngGrayscale(Uint8Array.from(img.data), img.width, img.height);
        } else {
          const rgb = new Uint8Array(img.width * img.height * 3);
          for (let i = 0, p = 0; i < img.width * img.height; i++) {
            const s = i * img.channels;
            rgb[p++] = img.data[s];
            rgb[p++] = img.data[s + 1];
            rgb[p++] = img.data[s + 2];
          }
          png = await encodePngRgb(rgb, img.width, img.height);
        }
        out.push({
          page: pageNo,
          width: img.width,
          height: img.height,
          png,
          mime: "image/png",
          inkRatio: 1,
        });
      }
    }
  } finally {
    await releasePdf(pdf);
  }
  return out;
}
