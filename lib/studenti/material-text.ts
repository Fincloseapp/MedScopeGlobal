import { unstable_cache } from "next/cache";
import { DocumentExtractError, extractDocument } from "@/lib/doc/extract";
import { getStudentMaterialById, type StudentMaterial } from "@/lib/studenti/materials";
import { fetchMaterialBytes, MaterialSourceError } from "@/lib/studenti/material-source";

/** Study materials may exceed the generic 10 MB upload limit. */
const MAX_MATERIAL_BYTES = 30 * 1024 * 1024;

export type MaterialTextContent =
  | { ok: true; kind: "text"; text: string; wordCount: number }
  | { ok: true; kind: "html"; html: string; wordCount: number }
  | {
      ok: false;
      reason: "unsupported" | "too_large" | "unavailable" | "empty";
      message: string;
    };

const UNSUPPORTED_TYPES = new Set(["ppt", "pptx", "zip", "rar", "7z", "rtf"]);

function countWords(text: string): number {
  const stripped = text.replace(/<[^>]+>/g, " ");
  const words = stripped.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function filenameForMaterial(material: StudentMaterial): string {
  const type = (material.file_type ?? "bin").toLowerCase();
  return `material.${type}`;
}

function mimeForFileType(fileType: string): string | undefined {
  switch (fileType) {
    case "pdf":
      return "application/pdf";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "txt":
      return "text/plain";
    default:
      return undefined;
  }
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const parsed = await pdfParse(buffer);
  const text = String(parsed.text ?? "").trim();
  if (!text) {
    throw new DocumentExtractError("No text extracted from document", "extract_failed");
  }
  return text
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function extractDocxHtml(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.convertToHtml({ buffer });
  const html = String(result.value ?? "").trim();
  if (!html) {
    throw new DocumentExtractError("No text extracted from document", "extract_failed");
  }
  return html;
}

async function extractMaterialTextInternal(material: StudentMaterial): Promise<MaterialTextContent> {
  const fileType = (material.file_type ?? "").toLowerCase();

  if (UNSUPPORTED_TYPES.has(fileType)) {
    return {
      ok: false,
      reason: "unsupported",
      message:
        "Textový náhled není pro tento typ souboru k dispozici. Materiál lze využít pouze jako studijní reference.",
    };
  }

  if (fileType === "doc") {
    return {
      ok: false,
      reason: "unsupported",
      message:
        "Starší formát DOC nelze spolehlivě převést na text. Doporučujeme vyhledat PDF verzi materiálu.",
    };
  }

  if (!["pdf", "docx", "txt"].includes(fileType)) {
    return {
      ok: false,
      reason: "unsupported",
      message: "Textový náhled tohoto formátu zatím není k dispozici.",
    };
  }

  let buffer: Buffer;
  try {
    buffer = await fetchMaterialBytes(material);
  } catch (error) {
    const message =
      error instanceof MaterialSourceError
        ? "Materiál se nepodařilo načíst ze zdroje."
        : "Materiál se nepodařilo načíst.";
    return { ok: false, reason: "unavailable", message };
  }

  if (buffer.length > MAX_MATERIAL_BYTES) {
    return {
      ok: false,
      reason: "too_large",
      message: "Materiál je příliš rozsáhlý pro textový náhled v prohlížeči.",
    };
  }

  try {
    if (fileType === "docx") {
      const html = await extractDocxHtml(buffer);
      return { ok: true, kind: "html", html, wordCount: countWords(html) };
    }

    if (fileType === "pdf") {
      const text = await extractPdfText(buffer);
      return { ok: true, kind: "text", text, wordCount: countWords(text) };
    }

    const extracted = await extractDocument(
      buffer,
      filenameForMaterial(material),
      mimeForFileType(fileType)
    );

    return {
      ok: true,
      kind: "text",
      text: extracted.text,
      wordCount: countWords(extracted.text),
    };
  } catch (error) {
    if (error instanceof DocumentExtractError && error.code === "too_large") {
      return {
        ok: false,
        reason: "too_large",
        message: "Materiál je příliš rozsáhlý pro textový náhled v prohlížeči.",
      };
    }

    return {
      ok: false,
      reason: "empty",
      message:
        "Z materiálu se nepodařilo extrahovat čitelný text. Obsah může být sken nebo obrázek.",
    };
  }
}

async function loadMaterialText(id: string): Promise<MaterialTextContent> {
  const material = await getStudentMaterialById(id);
  if (!material) {
    return { ok: false, reason: "unavailable", message: "Materiál nebyl nalezen." };
  }
  return extractMaterialTextInternal(material);
}

export const getCachedMaterialText = unstable_cache(
  loadMaterialText,
  ["student-material-text"],
  { revalidate: 86400, tags: ["student-material-text"] }
);
