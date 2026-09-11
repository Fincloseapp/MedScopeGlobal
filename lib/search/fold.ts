/** Accent-insensitive search tokens for Czech magazine queries (spánek → spanek). */

export function foldSearchText(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("cs")
    .replace(/[^a-z0-9+\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function queryMatchesHaystack(query: string, haystack: string): boolean {
  const q = foldSearchText(query);
  if (q.length < 2) return false;
  const h = foldSearchText(haystack);
  const tokens = q.split(" ").filter((token) => token.length >= 2);
  if (tokens.length === 0) return h.includes(q);
  return tokens.every((token) => h.includes(token));
}
