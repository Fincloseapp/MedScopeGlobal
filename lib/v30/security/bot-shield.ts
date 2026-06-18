/**
 * v30 bot shield — User-Agent heuristics for sensitive routes.
 */

const BLOCKED_USER_AGENTS = [
  /scrapy/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /httpx/i,
  /aiohttp/i,
  /go-http-client/i,
  /java\/[\d.]+/i,
  /libwww-perl/i,
  /semrush/i,
  /ahrefs/i,
  /mj12bot/i,
  /dotbot/i,
  /petalbot/i,
  /bytespider/i,
  /gptbot/i,
  /ccbot/i,
];

const ALLOWED_BOTS = [/googlebot/i, /bingbot/i, /duckduckbot/i, /slurp/i, /yandexbot/i];

export function isKnownScraper(userAgent: string | null): boolean {
  if (!userAgent) return false;
  if (ALLOWED_BOTS.some((p) => p.test(userAgent))) return false;
  return BLOCKED_USER_AGENTS.some((p) => p.test(userAgent));
}

const SENSITIVE_PREFIXES = ["/api/academy", "/admin"];

export function shouldBlockBot(
  userAgent: string | null,
  pathname: string
): boolean {
  if (!userAgent) return false;
  const sensitive = SENSITIVE_PREFIXES.some((p) => pathname.startsWith(p));
  if (!sensitive) return false;
  return isKnownScraper(userAgent);
}

export function getBotShieldStatus() {
  return {
    enabled: true,
    blockedPatterns: BLOCKED_USER_AGENTS.length,
    allowedBots: ALLOWED_BOTS.length,
    sensitiveRoutes: SENSITIVE_PREFIXES,
  };
}
