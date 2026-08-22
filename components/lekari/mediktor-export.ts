/** Client helpers: export MeDiktor notes as Word (.docx) or PDF. */

import {
  buildMediktorDocxBytes,
  buildMediktorPdfBytes,
  DOCX_MIME,
  PDF_MIME,
} from "@/lib/lekari/dokumentace/mediktor-files";

export type MediktorExportOpts = {
  title?: string;
  templateId?: string | null;
};

function bytesToBlobPart(bytes: Uint8Array): BlobPart {
  return new Uint8Array(bytes);
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function mediktorExportFilename(
  ext: "docx" | "pdf",
  templateId?: string | null
): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const tpl = (templateId || "zapis").replace(/[^\w.-]+/g, "_");
  return `MeDiktor-${tpl}-${stamp}.${ext}`;
}

/** @deprecated Use mediktorExportFilename("docx", …) */
export function mediktorDocFilename(templateId?: string | null): string {
  return mediktorExportFilename("docx", templateId);
}

export async function downloadMediktorDoc(
  note: string,
  opts?: MediktorExportOpts
): Promise<void> {
  if (!note.trim()) return;
  const title = opts?.title || "MeDiktor · klinický zápis";
  const bytes = await buildMediktorDocxBytes(note, title);
  const blob = new Blob([bytesToBlobPart(bytes)], { type: DOCX_MIME });
  triggerBlobDownload(blob, mediktorExportFilename("docx", opts?.templateId));
}

export function downloadMediktorPdf(
  note: string,
  opts?: MediktorExportOpts
): void {
  if (!note.trim()) return;
  const title = opts?.title || "MeDiktor · klinický zápis";
  const bytes = buildMediktorPdfBytes(note, title);
  const blob = new Blob([bytesToBlobPart(bytes)], { type: PDF_MIME });
  triggerBlobDownload(blob, mediktorExportFilename("pdf", opts?.templateId));
}

/** Share PDF (mobile-friendly) or DOCX; fall back to plain text. */
export async function shareMediktorDoc(
  note: string,
  opts?: MediktorExportOpts
): Promise<"file" | "text" | "copied"> {
  if (!note.trim()) return "text";
  const title = opts?.title || "MeDiktor zápis";
  const templateId = opts?.templateId;

  const pdfBytes = buildMediktorPdfBytes(note, title);
  const pdfFile = new File([bytesToBlobPart(pdfBytes)], mediktorExportFilename("pdf", templateId), {
    type: PDF_MIME,
  });

  try {
    if (navigator.share && navigator.canShare?.({ files: [pdfFile] })) {
      await navigator.share({ title, files: [pdfFile] });
      return "file";
    }

    const docxBytes = await buildMediktorDocxBytes(note, title);
    const docxFile = new File([bytesToBlobPart(docxBytes)], mediktorExportFilename("docx", templateId), {
      type: DOCX_MIME,
    });
    if (navigator.share && navigator.canShare?.({ files: [docxFile] })) {
      await navigator.share({ title, files: [docxFile] });
      return "file";
    }
    if (navigator.share) {
      await navigator.share({ title, text: note });
      return "text";
    }
  } catch (err) {
    if (err && typeof err === "object" && "name" in err && err.name === "AbortError") {
      throw err;
    }
  }

  await navigator.clipboard.writeText(note);
  return "copied";
}
