/** Client helpers: PDF download (MeDiktor generator) + senior print view. */

import {
  PDF_MIME,
  buildMediktorPdfBytes,
} from "@/lib/lekari/dokumentace/mediktor-files";
import {
  PATIENT_PDF_BRAND,
  PATIENT_PDF_CHROME_TITLE,
  PATIENT_PDF_FILENAME,
  PATIENT_PDF_KICKER,
  PATIENT_PDF_TITLE,
  buildPatientPrintHtml,
  buildPatientSummaryNote,
} from "@/lib/medipacient/export-print";
import { LEGAL_DISCLAIMER, type PatientSummary } from "@/lib/medipacient/patient-summary";

export { PATIENT_PDF_FILENAME };

function triggerDownload(bytes: Uint8Array, filename: string, mime: string): void {
  const blob = new Blob([new Uint8Array(bytes)], { type: mime });
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

export function downloadPatientSummaryPdf(summary: PatientSummary, documentName?: string): void {
  const note = buildPatientSummaryNote(summary, documentName);
  const bytes = buildMediktorPdfBytes(note, PATIENT_PDF_TITLE, {
    brand: PATIENT_PDF_BRAND,
    chromeTitle: PATIENT_PDF_CHROME_TITLE,
    kicker: PATIENT_PDF_KICKER,
    footer: summary.pravni_dolozka || LEGAL_DISCLAIMER,
  });
  triggerDownload(bytes, PATIENT_PDF_FILENAME, PDF_MIME);
}

function printViaIframe(html: string): void {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  if (!doc) {
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();
  window.setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    window.setTimeout(() => iframe.remove(), 2000);
  }, 300);
}

/** Large-type printable view (desktop + mobile: Tisknout → Uložit jako PDF). */
export function openPatientPrintPreview(summary: PatientSummary, documentName?: string): void {
  const html = buildPatientPrintHtml(summary, documentName);
  const w = window.open("", "_blank", "noopener,noreferrer,width=820,height=1100");
  if (!w) {
    printViaIframe(html);
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}
