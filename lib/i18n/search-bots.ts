/** Crawlers that must not be geo/language-redirected (hreflang + sitemaps instead). */
const SEARCH_BOT_RE =
  /googlebot|google-inspectiontool|bingbot|slurp|duckduckbot|baiduspider|yandex(?:bot|images)|seznambot|yeti|naver|sogou|exabot|facebot|facebookexternalhit|ia_archiver|applebot|semrushbot|ahrefsbot|dotbot|petalbot|bytespider/i;

export function isSearchEngineBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return SEARCH_BOT_RE.test(userAgent);
}
