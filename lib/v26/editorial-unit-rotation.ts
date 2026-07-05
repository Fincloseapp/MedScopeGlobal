/**
 * v26.3 — deterministic rotation across all 14 editorial units (TS mirror of .mjs).
 */
import { createHash } from "node:crypto";

/** All editorial units — keep in sync with lib/editorial/units.ts */
export const ALL_EDITORIAL_UNIT_IDS = [
  "medscope_global_editorial_board",
  "medscope_international_research",
  "medscope_clinical_insights",
  "medscope_global_health",
  "medscope_scientific_office",
  "medscope_ai_editorial",
  "medscope_medical_knowledge_lab",
  "medscope_evidence_synthesis",
  "medscope_cz_odborna",
  "medscope_cz_klinicka",
  "medscope_cz_analyzy",
  "medscope_cz_klinicky_obsah",
  "medscope_cz_research_desk",
  "medscope_cz_info_team",
] as const;

function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function pickEditorialUnitForArticle(
  seed: string,
  date: Date = new Date(),
  writerIndex = 0
): { primary: (typeof ALL_EDITORIAL_UNIT_IDS)[number]; reviewer: (typeof ALL_EDITORIAL_UNIT_IDS)[number] } {
  const n = ALL_EDITORIAL_UNIT_IDS.length;
  const day = dayOfYear(date);
  const hash = createHash("sha256").update(`editorial-unit:${seed}:${day}:${writerIndex}`).digest("hex");
  const primaryIdx = parseInt(hash.slice(0, 8), 16) % n;
  let reviewerIdx = (primaryIdx + 1 + parseInt(hash.slice(8, 12), 16)) % n;
  if (reviewerIdx === primaryIdx) reviewerIdx = (reviewerIdx + 1) % n;
  return {
    primary: ALL_EDITORIAL_UNIT_IDS[primaryIdx]!,
    reviewer: ALL_EDITORIAL_UNIT_IDS[reviewerIdx]!,
  };
}
