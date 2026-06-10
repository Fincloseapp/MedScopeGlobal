#!/usr/bin/env node
/** v24.2 SEO — keywords */
export function extractKeywords(base = [], section = "medicine") {
  const extra = { medicine: ["evidence-based"], drugs: ["SÚKL"], legislation: ["MZČR"] };
  return [...new Set([...base, ...(extra[section] ?? []), "MedScopeGlobal"])].slice(0, 12);
}
