/**
 * v26.3 — deterministic rotation across all 14 editorial units.
 * Ensures every MedScopeGlobal editorial unit appears in public article bylines over time.
 */
function hashEditorialSeed(input) {
  let h0 = 0x811c9dc5;
  let h1 = 0x01000193;
  let h2 = 0;
  let h3 = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h0 = Math.imul(h0 ^ ch, 0x01000193);
    h1 = Math.imul(h1 ^ (ch << (i % 16)), 0x01000193);
    h2 = (h2 + ch * (i + 1)) | 0;
    h3 = Math.imul(h3 ^ ch, 0x85ebca6b);
  }
  const hex = (n) => (n >>> 0).toString(16).padStart(8, "0");
  return hex(h0) + hex(h1) + hex(h2) + hex(h3);
}

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
];

function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / (1000 * 60 * 60 * 24));
}

/**
 * Pick primary + reviewer editorial units for an article (deterministic per seed/day/writer).
 * @param {string} seed
 * @param {Date} [date]
 * @param {number} [writerIndex]
 */
export function pickEditorialUnitForArticle(seed, date = new Date(), writerIndex = 0) {
  const n = ALL_EDITORIAL_UNIT_IDS.length;
  const day = dayOfYear(date);
  const hash = hashEditorialSeed(`editorial-unit:${seed}:${day}:${writerIndex}`);
  const primaryIdx = parseInt(hash.slice(0, 8), 16) % n;
  let reviewerIdx = (primaryIdx + 1 + parseInt(hash.slice(8, 12), 16)) % n;
  if (reviewerIdx === primaryIdx) reviewerIdx = (reviewerIdx + 1) % n;
  return {
    primary: ALL_EDITORIAL_UNIT_IDS[primaryIdx],
    reviewer: ALL_EDITORIAL_UNIT_IDS[reviewerIdx],
  };
}

/** List units used in last N simulated days (for audits). */
export function auditUnitCoverage(days = 14) {
  const used = new Set();
  const base = new Date();
  for (let d = 0; d < days; d++) {
    const date = new Date(base);
    date.setDate(date.getDate() - d);
    for (let w = 0; w < 5; w++) {
      const { primary, reviewer } = pickEditorialUnitForArticle(`audit:${d}:${w}`, date, w);
      used.add(primary);
      used.add(reviewer);
    }
  }
  const missing = ALL_EDITORIAL_UNIT_IDS.filter((id) => !used.has(id));
  return { used: [...used], missing, total: ALL_EDITORIAL_UNIT_IDS.length };
}
