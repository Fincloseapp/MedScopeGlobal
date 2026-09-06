/**
 * Local medicines / public-health regulator for chrome.
 * Czech SÚKL stays on /cs only — other editions name their own agency.
 */

import { normalizeLocale } from "@/lib/i18n/config";
import { chromePack } from "@/lib/i18n/chrome-pack";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";

const REGULATOR_SHORT: Record<string, string> = {
  cs: "SÚKL",
  sk: "ŠÚKL",
  pl: "URPL",
  de: "BfArM",
  fr: "ANSM",
  it: "AIFA",
  es: "AEMPS",
  pt: "INFARMED",
  "pt-BR": "ANVISA",
  "en-US": "FDA",
  "en-UK": "MHRA",
  en: "FDA",
};

const CITED_SOURCES: Record<string, string> = {
  cs: "SÚKL · EMA · WHO — citované zdroje",
  sk: "ŠÚKL · EMA · WHO — citované zdroje",
  de: "BfArM · EMA · WHO — zitierte Quellen",
  fr: "ANSM · EMA · OMS — sources citées",
  it: "AIFA · EMA · OMS — fonti citate",
  es: "AEMPS · EMA · OMS — fuentes citadas",
  "pt-BR": "ANVISA · OMS — fontes citadas",
  pt: "INFARMED · EMA · OMS — fontes citadas",
  "en-US": "FDA · CDC · WHO — cited sources",
  "en-UK": "MHRA · NICE · WHO — cited sources",
  en: "FDA · EMA · WHO — cited sources",
};

const MEDICAL_BOARD: Record<string, string> = {
  cs: "ČLK",
  en: "medical board",
  de: "Ärztekammer",
  fr: "ordre des médecins",
  it: "ordine dei medici",
  es: "colegio médico",
  "pt-BR": "conselho médico",
  pt: "ordem dos médicos",
};

function localeKey(locale?: string | null): string {
  const tag = normalizeLocale(locale ?? "cs");
  if (tag === "en-US" || tag === "en-UK") return tag;
  const primary = primaryArticleLocale(tag);
  if (primary === "cs") return "cs";
  return primary;
}

export function localRegulatorShort(locale?: string | null): string {
  const key = localeKey(locale);
  return REGULATOR_SHORT[key] ?? REGULATOR_SHORT[chromePack(locale)] ?? REGULATOR_SHORT.en!;
}

export function citedSourcesLine(locale?: string | null): string {
  const key = localeKey(locale);
  return CITED_SOURCES[key] ?? CITED_SOURCES[chromePack(locale)] ?? CITED_SOURCES.en!;
}

export function localMedicalBoard(locale?: string | null): string {
  const pack = chromePack(locale);
  return MEDICAL_BOARD[pack] ?? MEDICAL_BOARD.en!;
}

/** Rewrite leftover Czech institutions in already-translated chrome strings. */
export function rewriteCzechInstitutions(text: string, locale?: string | null): string {
  if (!text) return text;
  if (chromePack(locale) === "cs") return text;
  const regulator = localRegulatorShort(locale);
  const board = localMedicalBoard(locale);
  return text.replace(/SÚKL/g, regulator).replace(/ČLK/g, board);
}
