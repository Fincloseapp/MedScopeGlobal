#!/usr/bin/env node
/** v24.1 QA — duplicate detector */
function key(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 80);
}
export function detectDuplicate(title, existing) {
  const k = key(title);
  const hit = existing.find((t) => key(t) === k);
  return { isDuplicate: Boolean(hit), reason: hit ? `dup: ${hit}` : "" };
}
