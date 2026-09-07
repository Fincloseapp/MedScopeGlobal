/** Same-origin magazine path after Editorial checkout. */
export function safeEditorialReturnPath(raw?: string | null): string | null {
  const path = String(raw ?? "").trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) return null;
  const clean = (path.split("#")[0] ?? path).split("?")[0] ?? path;
  if (clean.length > 220) return null;
  if (
    clean.startsWith("/article/") ||
    clean.startsWith("/verejnost/clanky/") ||
    clean === "/articles"
  ) {
    return clean;
  }
  return null;
}

/** Stripe cancel_url: keep the article so retry unlocks the same piece. */
export function editorialCancelPath(returnPath?: string | null): string {
  const ret = safeEditorialReturnPath(returnPath);
  if (!ret) return "/predplatne?canceled=1";
  return `/predplatne?canceled=1&return=${encodeURIComponent(ret)}`;
}
