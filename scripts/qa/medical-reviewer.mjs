#!/usr/bin/env node
/** v24.1 QA — medical reviewer (CLI) */
const FORBIDDEN = [/dávkujte\s+\d+/i, /garantované\s+vyléčení/i];
export function reviewMedical(text) {
  const issues = FORBIDDEN.filter((re) => re.test(text)).map((re) => re.source);
  return { passed: !issues.length, issues };
}
if (process.argv[1]?.includes("medical-reviewer")) {
  const text = process.argv.slice(2).join(" ") || "test";
  console.log(reviewMedical(text));
}
