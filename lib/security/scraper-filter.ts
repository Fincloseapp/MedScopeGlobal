const BLOCKED_USER_AGENTS = [
  /scrapy/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /httpx/i,
  /go-http-client/i,
  /java\/[\d.]+/i,
  /libwww-perl/i,
  /semrush/i,
  /ahrefs/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
];

const ALLOWED_BOTS = [/googlebot/i, /bingbot/i, /duckduckbot/i, /slurp/i];

export function isKnownScraper(userAgent: string | null): boolean {
  if (!userAgent) return false;
  if (ALLOWED_BOTS.some((p) => p.test(userAgent))) return false;
  return BLOCKED_USER_AGENTS.some((p) => p.test(userAgent));
}

export function shouldBlockScraper(
  userAgent: string | null,
  pathname: string
): boolean {
  if (!userAgent) return false;
  if (pathname.startsWith("/api/")) return false;
  if (pathname.startsWith("/admin")) return false;
  return isKnownScraper(userAgent);
}
