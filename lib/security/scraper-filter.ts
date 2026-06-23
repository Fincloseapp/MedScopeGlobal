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

const ALLOWED_BOTS = [
  /googlebot/i,
  /bingbot/i,
  /duckduckbot/i,
  /slurp/i,
  /yandexbot/i,
  /uptimerobot/i,
  /pingdom/i,
  /statuscake/i,
  /site24x7/i,
  /datadog/i,
  /headlesschrome/i,
];

export function isKnownScraper(userAgent: string | null): boolean {
  if (!userAgent) return false;
  if (ALLOWED_BOTS.some((p) => p.test(userAgent))) return false;
  return BLOCKED_USER_AGENTS.some((p) => p.test(userAgent));
}

export function shouldBlockScraper(
  userAgent: string | null,
  pathname: string
): boolean {
  const sensitive = pathname.startsWith("/api/") || pathname.startsWith("/admin");

  // Public pages: allow requests without User-Agent (SEO crawlers, uptime monitors).
  if (!sensitive) {
    if (!userAgent?.trim()) return false;
    return isKnownScraper(userAgent);
  }

  // Sensitive routes: require a plausible browser UA.
  if (!userAgent || userAgent.trim().length < 8) return true;
  return isKnownScraper(userAgent);
}
