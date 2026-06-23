/**
 * Document extraction pipeline — PDF, DOCX, TXT, JPG/PNG (OCR).
 * Max upload size: 10 MB.
 */

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export type SupportedMime =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/plain"
  | "image/jpeg"
  | "image/png";

export type ExtractResult = {
  text: string;
  mimeType: string;
  byteLength: number;
  filename: string;
  method: "pdf" | "docx" | "txt" | "ocr" | "unknown";
};

export class DocumentExtractError extends Error {
  constructor(
    message: string,
    public readonly code: "too_large" | "unsupported" | "extract_failed"
  ) {
    super(message);
    this.name = "DocumentExtractError";
  }
}

function detectMime(filename: string, mimeType?: string): string {
  if (mimeType && mimeType !== "application/octet-stream") return mimeType;
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (lower.endsWith(".txt")) return "text/plain";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  return mimeType ?? "application/octet-stream";
}

function normalizeExtractedText(text: string): string {
  return text
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function validateDocumentSize(byteLength: number): void {
  if (byteLength > MAX_DOCUMENT_BYTES) {
    throw new DocumentExtractError(
      `Document exceeds ${MAX_DOCUMENT_BYTES} bytes (10 MB limit)`,
      "too_large"
    );
  }
  if (byteLength === 0) {
    throw new DocumentExtractError("Empty document", "extract_failed");
  }
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const parsed = await pdfParse(buffer);
  return String(parsed.text ?? "");
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return String(result.value ?? "");
}

async function extractOcr(buffer: Buffer): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("ces+eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(buffer);
    return String(text ?? "");
  } finally {
    await worker.terminate();
  }
}

function extractTxt(buffer: Buffer): string {
  return buffer.toString("utf8");
}

/** Extract plain text from a document buffer. */
export async function extractDocument(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<ExtractResult> {
  validateDocumentSize(buffer.length);

  const resolvedMime = detectMime(filename, mimeType);

  let text = "";
  let method: ExtractResult["method"] = "unknown";

  try {
    switch (resolvedMime) {
      case "application/pdf":
        text = await extractPdf(buffer);
        method = "pdf";
        break;
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        text = await extractDocx(buffer);
        method = "docx";
        break;
      case "text/plain":
        text = extractTxt(buffer);
        method = "txt";
        break;
      case "image/jpeg":
      case "image/png":
        text = await extractOcr(buffer);
        method = "ocr";
        break;
      default:
        throw new DocumentExtractError(
          `Unsupported file type: ${resolvedMime || filename}`,
          "unsupported"
        );
    }
  } catch (error) {
    if (error instanceof DocumentExtractError) throw error;
    throw new DocumentExtractError(
      error instanceof Error ? error.message : "Extraction failed",
      "extract_failed"
    );
  }

  const normalized = normalizeExtractedText(text);
  if (!normalized) {
    throw new DocumentExtractError("No text extracted from document", "extract_failed");
  }

  return {
    text: normalized,
    mimeType: resolvedMime,
    byteLength: buffer.length,
    filename,
    method,
  };
}

/** Segment long documents for inference context windows. */
export function segmentDocument(text: string, segmentSize = 4_000): string[] {
  const normalized = normalizeExtractedText(text);
  if (normalized.length <= segmentSize) return [normalized];

  const segments: string[] = [];
  const paragraphs = normalized.split(/\n{2,}/);
  let current = "";

  for (const paragraph of paragraphs) {
    const chunk = paragraph.trim();
    if (!chunk) continue;
    if ((current + "\n\n" + chunk).length <= segmentSize) {
      current = current ? `${current}\n\n${chunk}` : chunk;
    } else {
      if (current) segments.push(current);
      if (chunk.length <= segmentSize) {
        current = chunk;
      } else {
        for (let i = 0; i < chunk.length; i += segmentSize) {
          segments.push(chunk.slice(i, i + segmentSize));
        }
        current = "";
      }
    }
  }
  if (current) segments.push(current);
  return segments.length ? segments : [normalized.slice(0, segmentSize)];
}
