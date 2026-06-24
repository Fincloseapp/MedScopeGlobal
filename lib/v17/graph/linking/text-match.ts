const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "for",
  "with",
  "from",
  "that",
  "this",
  "are",
  "was",
  "were",
  "je",
  "jsou",
  "byl",
  "byla",
  "bylo",
  "pro",
  "na",
  "u",
  "s",
  "z",
  "ze",
  "do",
  "po",
  "od",
  "k",
  "v",
  "o",
  "a",
  "i",
  "nebo",
  "patient",
  "pacient",
  "pacienta",
  "diagnóza",
  "diagnosa",
  "léčba",
  "lecba",
  "riziko",
]);

export function nodeText(value: string | Record<string, unknown>): string {
  if (typeof value === "string") return value;
  if (typeof value.item === "string") return value.item;
  if (typeof value.text === "string") return value.text;
  return JSON.stringify(value);
}

export function tokens(text: string): string[] {
  return text.toLowerCase().match(/[a-zá-ž0-9]{3,}/gi) ?? [];
}

function filteredTokens(text: string): string[] {
  return tokens(text).filter((t) => !STOP_WORDS.has(t.toLowerCase()));
}

export function keywordMatchWeight(a: string, b: string): number {
  const ta = filteredTokens(a);
  const tb = filteredTokens(b);
  if (!ta.length || !tb.length) return 0;
  const tbSet = new Set(tb);
  let shared = 0;
  for (const t of ta) {
    if (tbSet.has(t)) shared += 1;
  }
  return shared / Math.max(ta.length, tb.length);
}

export function keywordOverlap(a: string, b: string): number {
  const ta = new Set(filteredTokens(a));
  const tb = new Set(filteredTokens(b));
  if (!ta.size || !tb.size) return 0;
  let shared = 0;
  for (const t of ta) {
    if (tb.has(t)) shared += 1;
  }
  return shared / Math.max(ta.size, tb.size);
}

export function textMentions(haystack: string, needle: string): boolean {
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  if (n.length >= 4 && (h.includes(n) || n.includes(h))) return true;
  return keywordOverlap(haystack, needle) >= 0.34;
}
