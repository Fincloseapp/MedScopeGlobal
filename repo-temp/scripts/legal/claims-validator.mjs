#!/usr/bin/env node
/** v24.3 Legal — claims */
const BANNED = [/100%\s+bezpečné/i, /bez\s+vedlejších\s+účinků/i];
export function validateClaims(text) {
  const issues = BANNED.filter((re) => re.test(text)).map((re) => re.source);
  return { passed: !issues.length, issues };
}
