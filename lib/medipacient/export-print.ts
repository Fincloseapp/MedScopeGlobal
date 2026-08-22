import { LEGAL_DISCLAIMER, type PatientSummary } from "@/lib/medipacient/patient-summary";
import { medicationsOf, type PatientMedication } from "@/lib/medipacient/medications";

export const PATIENT_PDF_FILENAME = "medipacient-preklad.pdf";
export const PATIENT_PDF_TITLE = "MeDipacient · srozumitelný překlad";
export const PATIENT_PDF_BRAND = "MeDipacient · MedScopeGlobal";
export const PATIENT_PDF_CHROME_TITLE = "Srozumitelný překlad zprávy";
export const PATIENT_PDF_KICKER =
  "Informační podpora pro pacienta. Nenahrazuje lékařskou péči ani osobní konzultaci.";

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });
}

function formatMed(med: PatientMedication): string {
  return med.dosage ? `${med.name} — ${med.dosage}` : med.name;
}

export function buildPatientSummaryNote(summary: PatientSummary, documentName?: string): string {
  const kontrola = formatDate(summary.termin_kontroly.vypoctene_datum);
  const leky = medicationsOf(summary);
  const lines: string[] = [
    PATIENT_PDF_TITLE,
    documentName ? `Zpráva: ${documentName}` : "",
    "",
    "1. Obor",
    summary.obor_lekare || "Neuvedeno",
    "",
    "2. Termín kontroly",
    summary.termin_kontroly.nalezeno && kontrola
      ? kontrola
      : "Termín kontroly ve zprávě nenašli.",
  ];
  if (summary.termin_kontroly.puvodni_text) {
    lines.push(`Ve zprávě: ${summary.termin_kontroly.puvodni_text}`);
  }
  lines.push("", "3. Srozumitelný překlad", summary.srozumitelny_preklad || "");
  lines.push("", "4. Doporučený postup");
  if (summary.doporuceny_postup.length) {
    for (const item of summary.doporuceny_postup) lines.push(`- ${item}`);
  } else {
    lines.push("Postup ve zprávě nenašli.");
  }
  if (leky.length) {
    lines.push("", "5. Léky");
    for (const med of leky) lines.push(`- ${formatMed(med)}`);
  }
  lines.push("", leky.length ? "6. Otázky pro lékaře" : "5. Otázky pro lékaře");
  if (summary.otazky_pro_lekare.length) {
    for (const item of summary.otazky_pro_lekare) lines.push(`- ${item}`);
  } else {
    lines.push("Žádné otázky jsme nesestavili.");
  }
  lines.push("", leky.length ? "7. Právní doložka" : "6. Právní doložka");
  lines.push(summary.pravni_dolozka || LEGAL_DISCLAIMER);
  lines.push("MeDipacient není zdravotnický prostředek.");
  return lines.filter((line, i, arr) => !(line === "" && arr[i - 1] === "")).join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function listHtml(items: string[]): string {
  if (!items.length) return "<p>Neuvedeno.</p>";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

export const PATIENT_PRINT_STYLES = `
  @page { size: A4; margin: 14mm; }
  html, body { margin: 0; padding: 0; background: #fff; color: #021d33; }
  body { font-family: Georgia, "Times New Roman", serif; font-size: 20pt; line-height: 1.45; padding: 16px; }
  h1 { font-size: 26pt; margin: 0 0 8pt 0; }
  .brand { font-size: 14pt; color: #2D7FF9; font-weight: 700; margin: 0 0 4pt 0; }
  .doc { font-size: 14pt; color: #334155; margin: 0 0 16pt 0; }
  h2 { font-size: 15pt; letter-spacing: 0.04em; text-transform: uppercase; color: #2D7FF9; margin: 18pt 0 6pt 0; }
  p, li { font-size: 20pt; line-height: 1.45; margin: 0 0 8pt 0; }
  ul { margin: 0 0 8pt 18pt; padding: 0; }
  .lek { font-size: 22pt; font-weight: 700; }
  .dose { font-size: 18pt; font-weight: 400; color: #1e293b; }
  .legal { border: 2px solid #f59e0b; background: #fffbeb; padding: 12pt; margin-top: 16pt; font-size: 16pt; }
  .no-print { margin: 0 0 16pt 0; }
  .no-print button { min-height: 56px; font-size: 18pt; padding: 8px 20px; border-radius: 999px; background: #2D7FF9; color: #fff; border: 0; font-weight: 700; }
  @media print { .no-print { display: none !important; } body { padding: 0; } }
`;

export function buildPatientPrintHtml(summary: PatientSummary, documentName?: string): string {
  const kontrola = formatDate(summary.termin_kontroly.vypoctene_datum);
  const leky = medicationsOf(summary);
  const legal = summary.pravni_dolozka || LEGAL_DISCLAIMER;
  const kontrolaHtml =
    summary.termin_kontroly.nalezeno && kontrola
      ? `<p>${escapeHtml(kontrola)}</p>${
          summary.termin_kontroly.puvodni_text
            ? `<p>Ve zprávě: ${escapeHtml(summary.termin_kontroly.puvodni_text)}</p>`
            : ""
        }`
      : "<p>Termín kontroly ve zprávě nenašli.</p>";
  const lekyHtml = leky.length
    ? `<h2>Léky</h2><ul>${leky
        .map(
          (med) =>
            `<li><span class="lek">${escapeHtml(med.name)}</span>${
              med.dosage ? ` <span class="dose">${escapeHtml(med.dosage)}</span>` : ""
            }</li>`,
        )
        .join("")}</ul>`
    : "";
  return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(PATIENT_PDF_FILENAME)}</title>
<style>${PATIENT_PRINT_STYLES}</style>
</head>
<body>
<p class="no-print"><button type="button" onclick="window.print()">Tisknout / uložit PDF</button></p>
<p class="brand">MeDipacient · MedScopeGlobal</p>
<h1>Srozumitelný překlad zprávy</h1>
${documentName ? `<p class="doc">${escapeHtml(documentName)}</p>` : ""}
<h2>Obor</h2>
<p>${escapeHtml(summary.obor_lekare || "Neuvedeno")}</p>
<h2>Termín kontroly</h2>
${kontrolaHtml}
<h2>Srozumitelný překlad</h2>
<p>${escapeHtml(summary.srozumitelny_preklad || "")}</p>
<h2>Doporučený postup</h2>
${listHtml(summary.doporuceny_postup)}
${lekyHtml}
<h2>Otázky pro lékaře</h2>
${listHtml(summary.otazky_pro_lekare)}
<p class="legal">${escapeHtml(legal)} MeDipacient není zdravotnický prostředek.</p>
</body>
</html>`;
}
