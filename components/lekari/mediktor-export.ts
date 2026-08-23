/** Client helpers: export MeDiktor notes as PDF, Word (.docx), or plain UTF-8 text. */

import { stripAnamnesisMachineBlock } from "@/lib/lekari/dokumentace/anamnesis";
import {
  buildMediktorDocxBytes,
  buildMediktorPdfBytes,
  buildMediktorTxtBytes,
  DOCX_MIME,
  PDF_MIME,
  TXT_MIME,
} from "@/lib/lekari/dokumentace/mediktor-files";

export type MediktorExportOpts = {
  title?: string;
  templateId?: string | null;
};

export type MediktorExportFormat = "pdf" | "docx" | "txt";

/** Clinician-facing note body — machine JSON stays in storage only. */
export function clinicianVisibleNote(note: string): string {
  return stripAnamnesisMachineBlock(note);
}

function toStandaloneBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Mobile browsers often finish the save after the share sheet / Files UI;
  // revoking at 1.5s truncates the blob and yields "document cannot be opened".
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

async function saveBytesAsFile(
  bytes: Uint8Array,
  filename: string,
  mime: string
): Promise<"shared" | "downloaded"> {
  const buffer = toStandaloneBuffer(bytes);
  const file = new File([buffer], filename, { type: mime, lastModified: Date.now() });

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return "shared";
      }
    } catch (err) {
      if (err && typeof err === "object" && "name" in err && err.name === "AbortError") {
        throw err;
      }
      // Fall through to anchor download
    }
  }

  triggerBlobDownload(new Blob([buffer], { type: mime }), filename);
  return "downloaded";
}

export function mediktorExportFilename(
  ext: MediktorExportFormat,
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

export async function downloadMediktorPdf(
  note: string,
  opts?: MediktorExportOpts
): Promise<"shared" | "downloaded" | void> {
  if (!note.trim()) return;
  const title = opts?.title || "MeDiktor · klinický zápis";
  const bytes = await buildMediktorPdfBytes(note, title);
  return saveBytesAsFile(
    bytes,
    mediktorExportFilename("pdf", opts?.templateId),
    PDF_MIME
  );
}

export async function downloadMediktorDoc(
  note: string,
  opts?: MediktorExportOpts
): Promise<"shared" | "downloaded" | void> {
  if (!note.trim()) return;
  const title = opts?.title || "MeDiktor · klinický zápis";
  const bytes = await buildMediktorDocxBytes(note, title);
  return saveBytesAsFile(
    bytes,
    mediktorExportFilename("docx", opts?.templateId),
    DOCX_MIME
  );
}

export async function downloadMediktorTxt(
  note: string,
  opts?: MediktorExportOpts
): Promise<"shared" | "downloaded" | void> {
  if (!note.trim()) return;
  const title = opts?.title || "MeDiktor · klinický zápis";
  const bytes = buildMediktorTxtBytes(note, title);
  return saveBytesAsFile(
    bytes,
    mediktorExportFilename("txt", opts?.templateId),
    TXT_MIME
  );
}

/**
 * Share PDF first (opens reliably on iOS/Android), then DOCX, then TXT,
 * then clinician-visible plain text — never the raw storage note with machine JSON.
 */
export async function shareMediktorDoc(
  note: string,
  opts?: MediktorExportOpts
): Promise<"file" | "text" | "copied"> {
  if (!note.trim()) return "text";
  const title = opts?.title || "MeDiktor zápis";
  const templateId = opts?.templateId;
  const visible = clinicianVisibleNote(note);

  const tryShareFile = async (
    bytes: Uint8Array,
    filename: string,
    mime: string
  ): Promise<boolean> => {
    if (!navigator.share || !navigator.canShare) return false;
    const file = new File([toStandaloneBuffer(bytes)], filename, {
      type: mime,
      lastModified: Date.now(),
    });
    if (!navigator.canShare({ files: [file] })) return false;
    await navigator.share({ title, files: [file] });
    return true;
  };

  try {
    const pdfBytes = await buildMediktorPdfBytes(note, title);
    if (
      await tryShareFile(
        pdfBytes,
        mediktorExportFilename("pdf", templateId),
        PDF_MIME
      )
    ) {
      return "file";
    }

    const docxBytes = await buildMediktorDocxBytes(note, title);
    if (
      await tryShareFile(
        docxBytes,
        mediktorExportFilename("docx", templateId),
        DOCX_MIME
      )
    ) {
      return "file";
    }

    const txtBytes = buildMediktorTxtBytes(note, title);
    if (
      await tryShareFile(
        txtBytes,
        mediktorExportFilename("txt", templateId),
        TXT_MIME
      )
    ) {
      return "file";
    }

    if (navigator.share) {
      await navigator.share({ title, text: visible });
      return "text";
    }
  } catch (err) {
    if (err && typeof err === "object" && "name" in err && err.name === "AbortError") {
      throw err;
    }
  }

  await navigator.clipboard.writeText(visible);
  return "copied";
}
