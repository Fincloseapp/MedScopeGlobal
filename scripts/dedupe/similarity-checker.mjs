#!/usr/bin/env node
function tokens(s) {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
}
export function similarity(a, b) {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  return inter / Math.max(ta.size, tb.size, 1);
}
