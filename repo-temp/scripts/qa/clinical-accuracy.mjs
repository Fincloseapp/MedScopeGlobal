#!/usr/bin/env node
/** v24.1 QA — clinical accuracy */
export function checkClinical(body, ddxCount = 0) {
  const issues = [];
  if (ddxCount < 3) issues.push("DDx < 3");
  if (!/klinický|léčba|prevence/i.test(body)) issues.push("málo klinických sekcí");
  return { passed: !issues.length, issues };
}
