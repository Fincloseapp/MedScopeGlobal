#!/usr/bin/env node
/** v24.6 Image AI — safe filter */
const UNSAFE = [/gore/i, /real patient photo/i];
export function isSafe(svg, alt) {
  const bad = UNSAFE.some((re) => re.test(svg) || re.test(alt));
  return { passed: !bad, issues: bad ? ["unsafe content"] : [] };
}
