#!/usr/bin/env node
/** v24.1 QA — consistency */
export function checkConsistency(title, summary, bodyLen) {
  const issues = [];
  if (bodyLen < summary.length * 2) issues.push("tělo příliš krátké");
  if (!title || !summary) issues.push("chybí title/summary");
  return { passed: !issues.length, issues };
}
if (process.argv[1]?.includes("consistency-checker")) {
  console.log(checkConsistency("Test", "Test summary.", 100));
}
