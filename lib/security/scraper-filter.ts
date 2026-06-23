const BLOCKED_USER_AGENTS = [
  /scrapy/i,
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
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /applebot/i,
  /curl/i,
  /wget/i,
  /medscope/i,
  /uptimerobot/i,
  /pingdom/i,
  /statuscake/i,
  /site24x7/i,
  /datadog/i,
  /newrelic/i,
  /sentry/i,
  /betteruptime/i,
  /checkly/i,
  /gtmetrix/i,
  /lighthouse/i,
  /google-inspectiontool/i,
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
  if (pathname.startsWith("/api/")) return false;
  if (pathname.startsWith("/admin")) return false;
  // Allow requests without UA (SEO crawlers, monitoring) on public pages
  if (!userAgent || userAgent.trim().length < 4) return false;
  return isKnownScraper(userAgent);
}
