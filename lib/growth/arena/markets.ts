import { GEO_LOCALE_MAP, GLOBAL_LOCALES, localeFromCountry, type GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { pathSegmentToLocale, resolveGlobalLocale } from "@/lib/i18n/locale-path";
import { resolveSupportedLocale } from "@/lib/i18n/config";
import { ARENA_DISCOVERY_LOCALES } from "@/lib/growth/arena/locales";
import { estimateKFactor, type ConversionWindow } from "@/lib/growth/arena/metrics";
import { isArenaTeamSlug, type ArenaTeamSlug } from "@/lib/growth/arena/config";

export type ArenaMarket = {
  locale: GlobalLocaleCode;
  label: string;
  countries: string[];
};

export type ArenaMarketScore = {
  locale: GlobalLocaleCode;
  label: string;
  countries: string[];
  alfa: ConversionWindow & { conversions: number; kFactor: number };
  beta: ConversionWindow & { conversions: number; kFactor: number };
  leader: ArenaTeamSlug | "tie";
};

export type ArenaAnalyticsEvent = {
  event: string;
  payload: Record<string, unknown>;
};

export function countriesForLocale(locale: string): string[] {
  const code = resolveGlobalLocale(locale);
  const listed = Object.entries(GEO_LOCALE_MAP)
    .filter(([, mapped]) => mapped === code)
    .map(([country]) => country)
    .sort();
  if (listed.length) return listed;
  const tag = GLOBAL_LOCALES.find((row) => row.code === code)?.hreflang.split("-")[1];
  return tag ? [tag] : [];
}

export function arenaMarkets(): ArenaMarket[] {
  return ARENA_DISCOVERY_LOCALES.map((locale) => {
    const row = GLOBAL_LOCALES.find((item) => item.code === locale);
    return {
      locale,
      label: row?.label ?? locale,
      countries: countriesForLocale(locale),
    };
  });
}

export function parseEditionLocale(raw?: string | null): GlobalLocaleCode | null {
  if (!raw?.trim()) return null;
  const supported = resolveSupportedLocale(raw);
  if (supported && ARENA_DISCOVERY_LOCALES.includes(supported as GlobalLocaleCode)) {
    return supported as GlobalLocaleCode;
  }
  return pathSegmentToLocale(raw.trim().toLowerCase());
}

export function eventEditionLocale(payload: Record<string, unknown>): GlobalLocaleCode | null {
  const raw = payload.locale ?? payload.lang ?? payload.edition;
  const fromLocale = parseEditionLocale(raw == null ? null : String(raw));
  if (fromLocale) return fromLocale;
  const country = payload.country ?? payload.cfCountry ?? payload.cf_ipcountry;
  if (country != null && String(country).trim() && String(country).toUpperCase() !== "XX") {
    return localeFromCountry(String(country));
  }
  return null;
}

export function eventMatchesTeam(payload: Record<string, unknown>, team: ArenaTeamSlug): boolean {
  const agent = String(payload.agent ?? payload.ref ?? payload.team ?? "");
  if (payload.team === team) return true;
  return agent === team || agent.startsWith(`${team}-`) || (isArenaTeamSlug(agent) && agent === team);
}

export function emptyWindow(): ConversionWindow {
  return { visits: 0, checkouts: 0, paid: 0, newsletters: 0 };
}

export function windowFromEvents(
  events: ArenaAnalyticsEvent[],
  team: ArenaTeamSlug,
  locale?: string | null
): ConversionWindow {
  const window = emptyWindow();
  const edition = locale ? resolveGlobalLocale(locale) : null;
  for (const row of events) {
    if (!eventMatchesTeam(row.payload, team)) continue;
    if (edition) {
      const eventLocale = eventEditionLocale(row.payload);
      if (eventLocale !== edition) continue;
    }
    if (row.event === "ai_agent_visit") window.visits += 1;
    if (row.event === "ai_agent_checkout") window.checkouts += 1;
    if (row.event === "ai_agent_newsletter") window.newsletters += 1;
    if (row.event === "ai_agent_paid") window.paid += 1;
  }
  return window;
}

function withK(window: ConversionWindow) {
  return {
    ...window,
    conversions: window.paid + window.checkouts,
    kFactor: estimateKFactor(window),
  };
}

export function scoreLocaleMarkets(events: ArenaAnalyticsEvent[]): ArenaMarketScore[] {
  return arenaMarkets().map((market) => {
    const alfa = withK(windowFromEvents(events, "alfa", market.locale));
    const beta = withK(windowFromEvents(events, "beta", market.locale));
    let leader: ArenaMarketScore["leader"] = "tie";
    if (alfa.conversions > beta.conversions) leader = "alfa";
    if (beta.conversions > alfa.conversions) leader = "beta";
    return { ...market, alfa, beta, leader };
  });
}
