#!/usr/bin/env node
/** v24.3 Legal — risk */
const RISK = [/vyléčí\s+vás/i, /bez\s+lékaře/i];
export function checkRisk(text) {
  const issues = RISK.filter((re) => re.test(text)).map((re) => re.source);
  return { passed: !issues.length, issues };
}
