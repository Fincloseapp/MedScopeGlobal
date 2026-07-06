import { unstable_cache } from "next/cache";
import { DocumentExtractError, extractDocument } from "@/lib/doc/extract";
import {
  extractDocText,
  extractPptText,
  extractRtfText,
  listRarArchive,
  listZipArchive,
} from "@/lib/studenti/material-extract";
import { getStudentMaterialById, type StudentMaterial } from "@/lib/studenti/materials";
import { fetchMaterialBytes, MaterialSourceError } from "@/lib/studenti/material-source";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

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

const ARCHIVE_TYPES = new Set(["zip", "rar", "7z"]);
const LEGACY_OFFICE_TYPES = new Set(["doc", "rtf", "ppt", "pptx"]);

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

function cachedContentFromMaterial(material: StudentMaterial): MaterialTextContent | null {
  const text = material.extracted_text?.trim();
  if (!text) return null;

  const kind = material.extracted_kind === "html" ? "html" : "text";
  const wordCount = countWords(text);
  if (kind === "html") {
    return { ok: true, kind: "html", html: text, wordCount };
  }
  return { ok: true, kind: "text", text, wordCount };
}

async function persistExtractedText(
  materialId: string,
  kind: "text" | "html",
  content: string
): Promise<void> {
  const supabase = tryCreateServiceRoleClient();
  if (!supabase) return;

  await supabase
    .from("student_materials")
    .update({
      extracted_text: content,
      extracted_kind: kind,
      text_extracted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", materialId);
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

async function extractFromBuffer(
  buffer: Buffer,
  fileType: string
): Promise<{ kind: "text" | "html"; content: string }> {
  if (fileType === "docx") {
    return { kind: "html", content: await extractDocxHtml(buffer) };
  }
  if (fileType === "pdf") {
    return { kind: "text", content: await extractPdfText(buffer) };
  }
  if (fileType === "doc") {
    return { kind: "text", content: await extractDocText(buffer) };
  }
  if (fileType === "rtf") {
    return { kind: "text", content: extractRtfText(buffer) };
  }
  if (fileType === "ppt" || fileType === "pptx") {
    return { kind: "text", content: await extractPptText(buffer) };
  }
  if (fileType === "zip") {
    return { kind: "text", content: await listZipArchive(buffer) };
  }
  if (fileType === "rar" || fileType === "7z") {
    return { kind: "text", content: listRarArchive(buffer) };
  }

  const extracted = await extractDocument(
    buffer,
    `material.${fileType}`,
    mimeForFileType(fileType)
  );
  return { kind: "text", content: extracted.text };
}

async function extractMaterialTextInternal(material: StudentMaterial): Promise<MaterialTextContent> {
  const cached = cachedContentFromMaterial(material);
  if (cached) return cached;

  const fileType = (material.file_type ?? "").toLowerCase();

  const supportedTypes = new Set([
    "pdf",
    "docx",
    "doc",
    "txt",
    "rtf",
    "ppt",
    "pptx",
    ...ARCHIVE_TYPES,
  ]);

  if (!supportedTypes.has(fileType)) {
    return {
      ok: false,
      reason: "unsupported",
      message:
        "Textový náhled není pro tento typ souboru k dispozici. Materiál lze využít pouze jako studijní reference.",
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
    const { kind, content } = await extractFromBuffer(buffer, fileType);
    const wordCount = countWords(content);

    if (LEGACY_OFFICE_TYPES.has(fileType) || ARCHIVE_TYPES.has(fileType)) {
      void persistExtractedText(material.id, kind, content);
    }

    if (kind === "html") {
      return { ok: true, kind: "html", html: content, wordCount };
    }
    return { ok: true, kind: "text", text: content, wordCount };
  } catch (error) {
    if (error instanceof DocumentExtractError && error.code === "too_large") {
      return {
        ok: false,
        reason: "too_large",
        message: "Materiál je příliš rozsáhlý pro textový náhled v prohlížeči.",
      };
    }

    if (ARCHIVE_TYPES.has(fileType)) {
      return {
        ok: true,
        kind: "text",
        text:
          fileType === "rar" || fileType === "7z"
            ? "Archiv — seznam souborů se nepodařilo načíst. Stáhněte archiv pro plný obsah."
            : "Archiv ZIP — seznam souborů se nepodařilo načíst.",
        wordCount: 0,
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

const getCachedExtraction = unstable_cache(
  async (id: string, materialSnapshot: string) => {
    void id;
    const material = JSON.parse(materialSnapshot) as StudentMaterial;
    return extractMaterialTextInternal(material);
  },
  ["student-material-text"],
  { revalidate: 86400, tags: ["student-material-text"] }
);

export async function getCachedMaterialText(id: string): Promise<MaterialTextContent> {
  const material = await getStudentMaterialById(id);
  if (!material) {
    return { ok: false, reason: "unavailable", message: "Materiál nebyl nalezen." };
  }
  return getCachedExtraction(id, JSON.stringify(material));
}
