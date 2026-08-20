import type { LabValue, Medication, PacientDocument, PatientSummary } from "@/lib/medipacient/types";

function findAll(re: RegExp, text: string): string[] {
  const out: string[] = [];
  const clone = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
  let m: RegExpExecArray | null;
  while ((m = clone.exec(text))) {
    const v = (m[1] || m[0]).replace(/\s+/g, " ").trim();
    if (v && !out.includes(v)) out.push(v);
  }
  return out;
}

function parseDateCs(text: string): string | null {
  const m = text.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if (!m) return null;
  const d = String(m[1]).padStart(2, "0");
  const mo = String(m[2]).padStart(2, "0");
  return `${m[3]}-${mo}-${d}`;
}

function flagFromName(name: string, raw: string): LabValue["flag"] {
  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n)) return undefined;
  const key = name.toLowerCase();
  if (key.includes("hba1c") && n >= 7) return "high";
  if (key.includes("ldl") && n >= 2.6) return "high";
  if (key.includes("bmi") && n >= 25) return "high";
  return "normal";
}

/** Best-effort Czech clinical extraction — educational, not a medical device. */
export function parseReportText(text: string, filename = "Nahraná zpráva"): PatientSummary {
  const diagnosy = [
    ...findAll(/\b([A-Z]\d{2}(?:\.\d+)?)\s+[^\n,]{3,60}/g, text),
    ...findAll(/\b(diabetes mellitus[^\n.]{0,40}|hypertenze[^\n.]{0,30}|hyperlipidemie[^\n.]{0,20})/gi, text),
  ].slice(0, 8);

  const leky: Medication[] = findAll(
    /\b(metformin|perindopril|atorvastatin|ramipril|amlodipin|bisoprolol|insulin\w*|empagliflozin|losartan|rosuvastatin)[^\n]{0,40}/gi,
    text
  ).map((line) => {
    const dose = line.match(/(\d+(?:[.,]\d+)?\s*mg)/i)?.[1];
    const schedule = line.match(/(\d-\d-\d)/)?.[1];
    const name = line.split(/[\s,]/)[0] ?? line;
    return { name, dose, schedule };
  });

  const labCandidates: Array<[string, RegExp]> = [
    ["HbA1c", /HbA1c[^\d]{0,12}(\d+[.,]\d+)/i],
    ["LDL", /LDL[^\d]{0,12}(\d+[.,]\d+)/i],
    ["HDL", /HDL[^\d]{0,12}(\d+[.,]\d+)/i],
    ["Glukóza", /[Gg]luk[oó]za[^\d]{0,16}(\d+[.,]\d+)/],
    ["eGFR", /eGFR[^\d]{0,8}(\d+)/i],
    ["TK", /TK[^\d]{0,8}(\d{2,3}\s*\/\s*\d{2,3})/i],
  ];
  const labValues: LabValue[] = [];
  for (const [name, re] of labCandidates) {
    const m = text.match(re);
    if (m?.[1]) {
      labValues.push({
        name,
        value: m[1].replace(/\s+/g, ""),
        flag: flagFromName(name, m[1]),
      });
    }
  }

  const kontrolaLine =
    text.match(/kontrol[ay]?[^\n]{0,40}(\d{1,2}\.\s*\d{1,2}\.\s*\d{4})/i)?.[0] ??
    text.match(/(\d{1,2}\.\s*\d{1,2}\.\s*\d{4})/)?.[0] ??
    null;
  const date = kontrolaLine ? parseDateCs(kontrolaLine) : null;

  const obor =
    text.match(/\b(kardiolog\w*|diabetolog\w*|praktick\w*|endokrinolog\w*|neurolog\w*|internist\w*)/i)?.[0] ??
    "Lékařská zpráva";

  return {
    obor_lekare: obor,
    diagnosy: diagnosy.length ? diagnosy : [`Nahraný dokument: ${filename}`],
    leky,
    labValues,
    termin_kontroly: {
      nalezeno: Boolean(date),
      vypoctene_datum: date,
      puvodni_text: kontrolaLine,
    },
    otazky_pro_lekare: [
      "Co z této zprávy je nejdůležitější do příští kontroly?",
      "Mám změnit nějaký lék, nebo jen režim?",
    ],
    doporuceni: findAll(/(s[uů]l do[^\n.]{5,40}|ch[uů]ze[^\n.]{5,40}|kontrola[^\n.]{5,40})/gi, text).slice(
      0,
      4
    ),
  };
}

export function documentFromUpload(opts: {
  id: string;
  filename: string;
  text: string;
  createdAt?: string;
}): PacientDocument {
  const summary = parseReportText(opts.text, opts.filename);
  const title = summary.diagnosy[0]?.slice(0, 80) || opts.filename;
  return {
    id: opts.id,
    title,
    facility: "Nahráno v MeDipacient",
    kind: "upload",
    createdAt: opts.createdAt ?? new Date().toISOString(),
    excerpt: opts.text.replace(/\s+/g, " ").trim().slice(0, 180),
    fullText: opts.text,
    demo: false,
    ocrReady: true,
    patientSummary: summary,
  };
}
