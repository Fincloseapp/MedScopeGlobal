import { generateJsonFromAllLlmProviders } from "@/lib/ai/chat-json";

import {
  asMedicationList,
  mergeMedications,
  parseMedicationsFromText,
  type PatientMedication,
} from "@/lib/medipacient/medications";
import {
  mergeAiWithParser,
  recommendationLabelsCs,
  type LabValue,
  type ParserMergeResult,
  type Recommendation,
  type VisitPlanStored,
} from "@/lib/medipacient/medicalParserCZ";
import { scheduleRemindersFromPlan, type ScheduledReminder } from "@/lib/medipacient/reminderEngine";

export const LEGAL_DISCLAIMER =
  "Tento výstup je generován specializovanou AI MedScope a slouží pouze jako informační podpora. Nenahrazuje lékařskou péči ani osobní konzultaci.";

export const EXTRACT_FAILED_CS =
  "Z dokumentu se nepodařilo přečíst srozumitelný text. Zkuste ostřejší fotografii celé stránky, nebo nahrajte PDF z e-mailu. Soubor máte uložený — nemusíte ho nahrávat znovu.";

export const AI_FAILED_CS =
  "Překlad se teď nepodařil. Originál máte uložený — zkuste Znovu zpracovat, nebo otevřete originál. Soubor znovu nahrávat nemusíte.";

export const DOCUMENT_NOT_FOUND_CS = "Dokument nenalezen.";

export const DOCUMENT_RETRY_CS =
  "Soubor je uložený, ale zobrazení se teď nepodařilo dokončit. Zkuste Znovu zpracovat — nahrávat znovu nemusíte.";

export const DOCUMENTS_NEVER_DELETED_CS =
  "Zprávy v MeDipacient se nesmažou. Originál zůstane u účtu — v Účtu si můžete stáhnout JSON (GDPR).";

export const MIN_OCR_CHARS = 18;

const CZECH_DIACRITICS_RE = /[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/;
const MEDICAL_HINT_RE =
  /dg\.?|diagn|kontrola|doporuč|lékař|lekar|pacient|medikac|vyšetř|vysetr|nález|nalez|anamnéz|ordinac|hospital|zpráva|zprava|praktick|interní|kardiolog|prohlídk|propoušt/i;

export function isUsableMedicalText(text: string): boolean {
  const t = anonymizePhi(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length < MIN_OCR_CHARS) return false;
  const letters = [...t].filter((ch) => /\p{L}/u.test(ch)).length;
  if (letters < 12) return false;
  if (/\(cid:\d+\)/i.test(t) && letters < 80) return false;
  return CZECH_DIACRITICS_RE.test(t) || MEDICAL_HINT_RE.test(t) || letters >= 48;
}

export class MedicalExtractError extends Error {
  constructor(message = EXTRACT_FAILED_CS) {
    super(message);
    this.name = "MedicalExtractError";
  }
}

export const PATIENT_SUMMARY_KEYS = [
  "obor_lekare",
  "termin_kontroly",
  "srozumitelny_preklad",
  "doporuceny_postup",
  "otazky_pro_lekare",
  "pravni_dolozka",
] as const;

export type PatientTerminKontroly = {
  nalezeno: boolean;
  puvodni_text: string;
  vypoctene_datum: string | null;
};

export type PatientSummary = {
  obor_lekare: string;
  termin_kontroly: PatientTerminKontroly;
  srozumitelny_preklad: string;
  doporuceny_postup: string[];
  otazky_pro_lekare: string[];
  pravni_dolozka: string;
  /** Optional; not part of the required JSON schema. */
  leky?: PatientMedication[];
  lab_values?: LabValue[];
  recommendations?: Recommendation[];
  visit_plan?: VisitPlanStored | null;
};

export type StructuredExtract = ParserMergeResult & {
  reminderCandidates: ScheduledReminder[];
};

const RODNE_CISLO_RE = /\b\d{6}\s*\/?\s*\d{3,4}\b/g;

const SPECIALTY_HINTS: Array<[RegExp, string]> = [
  [/kardiolog/i, "Kardiologie"],
  [/neurolog/i, "Neurologie"],
  [/internist|interní lék/i, "Interní lékařství"],
  [/endokrinolog/i, "Endokrinologie"],
  [/diabetolog/i, "Diabetologie"],
  [/gastroenterolog/i, "Gastroenterologie"],
  [/pneumolog|plicní/i, "Pneumologie"],
  [/nefrolog/i, "Nefrologie"],
  [/onkolog/i, "Onkologie"],
  [/ortoped/i, "Ortopedie"],
  [/chirurg/i, "Chirurgie"],
  [/urolog/i, "Urologie"],
  [/gynekolog/i, "Gynekologie"],
  [/oční|oftalmolog/i, "Oftalmologie"],
  [/orl|otorinolaryngolog/i, "ORL"],
  [/dermatolog|kožní/i, "Dermatologie"],
  [/psychiatr/i, "Psychiatrie"],
  [/praktick/i, "Všeobecné praktické lékařství"],
];

export function pragueToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function anonymizePhi(text: string): string {
  return (text || "").replace(RODNE_CISLO_RE, "[anonymizováno]");
}

export function patientSummarySystemPrompt(): string {
  return `Jsi specializovaná medicínská AI na MedScopeGlobal.com.
Analyzuješ anonymizovaný text české lékařské zprávy a vracíš strukturovaný JSON pro pacienta.

Pravidla:
1. Piš jednoduchou češtinou pro laiky a seniory. Empaticky, klidně, profesionálně, v duchu EBM. Nikdy nestraš ani nevyvolávej paniku.
2. Překládej latinské termíny a zkratky. Pokud je diagnóza nejistá („susp.“), vysvětli, že jde o podezření, které musí lékař ještě potvrdit.
3. Do pacientského textu vždy na konec vlož větu:
„${LEGAL_DISCLAIMER}“
(Dej ji jako poslední větu do srozumitelny_preklad A ZÁROVEŇ do pole pravni_dolozka.)
4. Nehalucinuj. Pokud údaj ve zprávě chybí, použij prázdný řetězec / prázdné pole / nalezeno=false / null.
5. Neuváděj rodné číslo, jména ani jiné identifikátory. Text je anonymizovaný.
6. CURRENT_DATE v uživatelské zprávě je dnešní datum (Europe/Prague). Když zpráva říká „za 3 měsíce“ apod., spočítej vypoctene_datum od CURRENT_DATE jako YYYY-MM-DD.
7. Explicitní datum („příští návštěva 12.10.2026“) má přednost před relativním („za 6 týdnů“).

Vrať POUZE validní JSON (bez markdownu):
{
  "obor_lekare": "Název specializace (např. Kardiologie, Neurologie)",
  "termin_kontroly": {
    "nalezeno": true,
    "puvodni_text": "citace ze zprávy",
    "vypoctene_datum": "YYYY-MM-DD nebo null"
  },
  "srozumitelny_preklad": "3–5 krátkých vět, laický jazyk, hlavní závěr, poslední větou právní doložka",
  "doporuceny_postup": ["odrážky doporučení"],
  "otazky_pro_lekare": ["2–3 konkrétní otázky na příští návštěvu"],
  "pravni_dolozka": "${LEGAL_DISCLAIMER}",
  "lab_values": [{"name":"CRP","value":18,"unit":"mg/l","raw":"CRP 18 mg/l"}],
  "recommendations": [{"text":"Doporučuji neurologii","kind":"referral","target":"neurologie"}],
  "visit_plan": {
    "date_iso": "YYYY-MM-DD nebo null",
    "original_text": "citace",
    "where": "neurologie / praktický lékař / null",
    "interval_months": null,
    "repeating": false
  },
  "control_date_iso": "YYYY-MM-DD nebo null"
}

Volitelné (není povinné): pokud zpráva obsahuje léky, přidej
"leky": [{"name":"název","dosage":"síla a dávkování"}].
Pokud pole ve zprávě chybí, použij prázdné pole / null.`;
}

function parseIsoDate(value: unknown): string | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const m = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

function addMonths(start: Date, months: number): Date {
  const year = start.getUTCFullYear() + Math.floor((start.getUTCMonth() + months) / 12);
  const month = (start.getUTCMonth() + months) % 12;
  const day = Math.min(start.getUTCDate(), new Date(Date.UTC(year, month + 1, 0)).getUTCDate());
  return new Date(Date.UTC(year, month, day));
}

function toUtcDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function isoUtc(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function computeRelativeControlDate(text: string, currentDate: string): string | null {
  const today = toUtcDate(parseIsoDate(currentDate) || pragueToday());
  const blob = text.toLowerCase();
  const days = blob.match(/za\s+(\d+)\s+(den|dny|dnů|dní)/);
  if (days) {
    today.setUTCDate(today.getUTCDate() + Number(days[1]));
    return isoUtc(today);
  }
  if (/\bza\s+týden\b/.test(blob)) return isoUtc(new Date(today.getTime() + 7 * 86400000));
  const weeks = blob.match(/za\s+(\d+)\s+(týden|týdny|týdnů)/);
  if (weeks) return isoUtc(new Date(today.getTime() + Number(weeks[1]) * 7 * 86400000));
  if (/\bza\s+měsíc\b/.test(blob)) return isoUtc(addMonths(today, 1));
  const months = blob.match(/za\s+(\d+)\s+(měsíc|měsíce|měsíců)/);
  if (months) return isoUtc(addMonths(today, Number(months[1])));
  if (/\bza\s+rok\b/.test(blob)) return isoUtc(addMonths(today, 12));
  const years = blob.match(/za\s+(\d+)\s+(rok|roky|let)/);
  if (years) return isoUtc(addMonths(today, Number(years[1]) * 12));
  return null;
}

function guessSpecialty(text: string): string {
  for (const [re, label] of SPECIALTY_HINTS) {
    if (re.test(text)) return label;
  }
  const m = text.match(/(?:odbornost|specialist[a]?|obor)[:\s]+(.+)/i);
  return m?.[1]?.trim().slice(0, 80) || "Lékařská zpráva";
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function ensureDisclaimer(text: string): string {
  const cleaned = anonymizePhi((text || "").trim()) ||
    "Zprávu jsme přečetli v klidu a srozumitelně. Podrobnosti prosím vždy ověřte se svým lékařem.";
  return cleaned.includes(LEGAL_DISCLAIMER) ? cleaned : `${cleaned} ${LEGAL_DISCLAIMER}`;
}

function visitFromAi(data: Record<string, unknown>): Partial<VisitPlanStored> | null {
  const raw = (data.visit_plan || data.visitPlan) as Record<string, unknown> | undefined;
  if (!raw || typeof raw !== "object") return null;
  const dateIso = parseIsoDate(raw.date_iso || raw.dateIso);
  const monthsRaw = raw.interval_months ?? raw.intervalMonths;
  return {
    dateIso,
    originalText: String(raw.original_text || raw.originalText || ""),
    where: raw.where ? String(raw.where) : null,
    intervalMonths: typeof monthsRaw === "number" ? monthsRaw : null,
    repeating: Boolean(raw.repeating),
    source: dateIso ? "explicit" : "relative",
  };
}

export function structuredExtractFromSummary(
  summary: PatientSummary,
  sourceText: string,
  currentDate: string,
  raw: unknown = {},
): StructuredExtract {
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const merged = mergeAiWithParser({
    text: sourceText,
    currentDate,
    aiControlIso: summary.termin_kontroly.vypoctene_datum || parseIsoDate(data.control_date_iso),
    aiControlText: summary.termin_kontroly.puvodni_text,
    aiLabs: data.lab_values || data.labValues,
    aiRecommendations: data.recommendations || summary.doporuceny_postup,
    aiVisit: visitFromAi(data),
  });
  const reminderCandidates = scheduleRemindersFromPlan({
    documentId: "pending",
    visitPlan: merged.visitPlan,
    controlDate: merged.controlDate,
    obor: summary.obor_lekare,
    todayIso: currentDate,
  });
  return { ...merged, reminderCandidates };
}

export function applyStructuredExtract(summary: PatientSummary, extract: ParserMergeResult): PatientSummary {
  const labels = recommendationLabelsCs(extract.recommendations);
  const postup = [...summary.doporuceny_postup];
  for (const label of labels) {
    if (!postup.some((item) => item.toLowerCase().includes(label.toLowerCase().slice(0, 24)))) {
      postup.unshift(label);
    }
  }
  return {
    ...summary,
    termin_kontroly: {
      nalezeno: Boolean(extract.controlDate) || summary.termin_kontroly.nalezeno,
      puvodni_text: anonymizePhi(extract.controlOriginal || summary.termin_kontroly.puvodni_text).slice(0, 240),
      vypoctene_datum: extract.controlDate || summary.termin_kontroly.vypoctene_datum,
    },
    doporuceny_postup: postup.slice(0, 12).map(anonymizePhi),
    lab_values: extract.labValues,
    recommendations: extract.recommendations,
    visit_plan: extract.visitPlan,
  };
}

export function normalizePatientSummary(raw: unknown, currentDate: string, sourceText = ""): PatientSummary {
  const data = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const terminRaw = data.termin_kontroly && typeof data.termin_kontroly === "object"
    ? (data.termin_kontroly as Record<string, unknown>)
    : {};
  const abs = sourceText.match(/(?:kontrola|kontrolu|control)[^\d]{0,24}(\d{1,2}\.\d{1,2}\.\d{4})/i);
  const relative = computeRelativeControlDate(sourceText, currentDate);
  const vypoctene = parseIsoDate(terminRaw.vypoctene_datum) || (abs ? parseIsoDate(abs[1]) : null) || relative;
  let postup = asStringList(data.doporuceny_postup);
  if (!postup.length) {
    postup = [
      "Řiďte se pokyny z lékařské zprávy a užívejte předepsané léky tak, jak vám lékař řekl.",
      "Pokud se objeví nové nebo zhoršující se potíže, ozvěte se svému lékaři.",
    ];
  }
  let otazky = asStringList(data.otazky_pro_lekare);
  if (otazky.length < 2) {
    otazky = [
      "Co je pro mě teď nejdůležitější hlídat do příští kontroly?",
      "Mám nějak upravit léky, pohyb nebo stravu?",
      "Kdy se mám ozvat dřív, pokud se něco změní?",
    ];
  }
  const leky = mergeMedications(
    asMedicationList(data.leky),
    parseMedicationsFromText(sourceText),
    parseMedicationsFromText(postup.join("\n")),
  );
  const summary: PatientSummary = {
    obor_lekare: anonymizePhi(String(data.obor_lekare || guessSpecialty(sourceText))).slice(0, 120),
    termin_kontroly: {
      nalezeno: Boolean(terminRaw.nalezeno) || Boolean(vypoctene),
      puvodni_text: anonymizePhi(String(terminRaw.puvodni_text || abs?.[0] || "")).slice(0, 240),
      vypoctene_datum: vypoctene,
    },
    srozumitelny_preklad: ensureDisclaimer(String(data.srozumitelny_preklad || "")),
    doporuceny_postup: postup.slice(0, 12).map(anonymizePhi),
    otazky_pro_lekare: otazky.slice(0, 5).map(anonymizePhi),
    pravni_dolozka: LEGAL_DISCLAIMER,
  };
  if (leky.length) summary.leky = leky.map((m) => ({ name: anonymizePhi(m.name), dosage: anonymizePhi(m.dosage) }));
  const extract = structuredExtractFromSummary(summary, sourceText, currentDate, data);
  return applyStructuredExtract(summary, extract);
}

export function heuristicPatientSummary(text: string, currentDate = pragueToday()): PatientSummary {
  const dg = [...text.matchAll(/(?:Dg\.|Diagnóza|Diagnosis)[:\s]+(.+)/gi)].map((m) => m[1].trim());
  const recs = [...text.matchAll(/(?:Doporučení|Recommendation)[:\s]+(.+)/gi)].map((m) => m[1].trim());
  const uncertain = /\bsusp\.?\b/i.test(text);
  const body = dg.slice(0, 2).join(" ");
  let preklad = body
    ? uncertain || /\bsusp\.?\b/i.test(body)
      ? `Ve zprávě je uvedeno podezření na ${body}. Znamená to, že lékař ještě potřebuje nález potvrdit, nejde o jistou diagnózu.`
      : `Hlavní závěr zprávy se týká tohoto: ${body}.`
    : "Lékařská zpráva popisuje vyšetření a další postup. Níže najdete klidné shrnutí toho podstatného.";
  preklad += " Doporučení berte jako orientační přehled — konkrétní léčbu vždy určuje váš lékař.";
  return normalizePatientSummary(
    {
      obor_lekare: guessSpecialty(text),
      srozumitelny_preklad: preklad,
      doporuceny_postup: recs,
    },
    currentDate,
    text,
  );
}

export function hasRequiredPatientKeys(summary: PatientSummary): boolean {
  return PATIENT_SUMMARY_KEYS.every((key) => key in summary) && Boolean(summary.srozumitelny_preklad.includes(LEGAL_DISCLAIMER));
}

export async function analyzeMedicalReportText(
  text: string,
  currentDate = pragueToday(),
): Promise<{ summary: PatientSummary; modelVersion: string; ocrText: string; extract: StructuredExtract }> {
  const clean = anonymizePhi(text || "");
  if (clean.trim().length < MIN_OCR_CHARS) {
    throw new MedicalExtractError(EXTRACT_FAILED_CS);
  }
  const fallback = heuristicPatientSummary(clean, currentDate);
  let summary = fallback;
  let modelVersion = "heuristic-v1";
  let raw: unknown = {};
  try {
    const { data } = await generateJsonFromAllLlmProviders<Partial<PatientSummary>>({
      system: patientSummarySystemPrompt(),
      user: `CURRENT_DATE: ${currentDate}\n\nText lékařské zprávy (anonymizovaný):\n${clean.slice(0, 20_000)}`,
      temperature: 0.2,
      maxTokens: 2200,
    });
    if (data && typeof data === "object") {
      raw = data;
      summary = normalizePatientSummary(data, currentDate, clean);
      modelVersion = "hub-llm/patient-v2";
    }
  } catch {
    // heuristic fallback — parser still runs below
  }
  const extract = structuredExtractFromSummary(summary, clean, currentDate, raw);
  summary = applyStructuredExtract(summary, extract);
  return { summary, modelVersion, ocrText: clean, extract };
}
