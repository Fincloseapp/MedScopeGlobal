import { GEO_LOCALE_MAP, GLOBAL_LOCALES, localeFromCountry, type GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { pathSegmentToLocale, resolveGlobalLocale } from "@/lib/i18n/locale-path";
import { resolveSupportedLocale } from "@/lib/i18n/config";
import { normalizeAiAgentSlug } from "@/lib/growth/ai-agent-program";
import { ARENA_DISCOVERY_LOCALES } from "@/lib/growth/arena/locales";
import { estimateKFactor, type ConversionWindow } from "@/lib/growth/arena/metrics";
import { isArenaTeamSlug, type ArenaTeamSlug } from "@/lib/growth/arena/config";
import { payloadCountry } from "@/lib/growth/request-country";

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
  const country = payloadCountry(payload);
  if (country) return localeFromCountry(country);
  return null;
}

export function eventCountryCode(payload: Record<string, unknown>): string | null {
  return payloadCountry(payload);
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
    return { ...market, alfa, beta, leader: leaderOf(alfa, beta) };
  });
}

export type ArenaTeamWindow = ConversionWindow & { conversions: number; kFactor: number };

export type ArenaCountryScore = {
  country: string;
  locale: GlobalLocaleCode | null;
  alfa: ArenaTeamWindow;
  beta: ArenaTeamWindow;
  leader: ArenaTeamSlug | "tie";
  activity: number;
};

export type CountryAgentCell = ConversionWindow & { agent: string };

export type CountryTrafficRow = {
  country: string;
  locale: GlobalLocaleCode | null;
  visits: number;
  checkouts: number;
  paid: number;
  newsletters: number;
  topAgent: string | null;
  agents: CountryAgentCell[];
};

function activityOf(window: ConversionWindow): number {
  return window.visits + window.checkouts + window.paid + window.newsletters;
}

function leaderOf(alfa: ArenaTeamWindow, beta: ArenaTeamWindow): ArenaTeamSlug | "tie" {
  if (alfa.conversions !== beta.conversions) {
    return alfa.conversions > beta.conversions ? "alfa" : "beta";
  }
  if (alfa.visits !== beta.visits) {
    return alfa.visits > beta.visits ? "alfa" : "beta";
  }
  return "tie";
}

export function knownArenaCountries(): string[] {
  return [...new Set(Object.keys(GEO_LOCALE_MAP))].sort();
}

export function windowFromCountryEvents(
  events: ArenaAnalyticsEvent[],
  team: ArenaTeamSlug,
  country: string
): ConversionWindow {
  const window = emptyWindow();
  for (const row of events) {
    if (!eventMatchesTeam(row.payload, team)) continue;
    if (eventCountryCode(row.payload) !== country) continue;
    if (row.event === "ai_agent_visit") window.visits += 1;
    if (row.event === "ai_agent_checkout") window.checkouts += 1;
    if (row.event === "ai_agent_newsletter") window.newsletters += 1;
    if (row.event === "ai_agent_paid") window.paid += 1;
  }
  return window;
}

export function scoreCountryMarkets(events: ArenaAnalyticsEvent[]): ArenaCountryScore[] {
  const seen = new Set<string>();
  for (const row of events) {
    const code = eventCountryCode(row.payload);
    if (code) seen.add(code);
  }
  return [...seen]
    .map((country) => {
      const alfa = withK(windowFromCountryEvents(events, "alfa", country));
      const beta = withK(windowFromCountryEvents(events, "beta", country));
      return {
        country,
        locale: GEO_LOCALE_MAP[country] ?? (seen.has(country) ? localeFromCountry(country) : null),
        alfa,
        beta,
        leader: leaderOf(alfa, beta),
        activity: activityOf(alfa) + activityOf(beta),
      };
    })
    .sort((a, b) => b.activity - a.activity || a.country.localeCompare(b.country));
}

export function scoreCountryTraffic(events: ArenaAnalyticsEvent[]): CountryTrafficRow[] {
  const byCountry = new Map<string, Map<string, ConversionWindow>>();
  for (const row of events) {
    const country = eventCountryCode(row.payload);
    if (!country) continue;
    const agent =
      normalizeAiAgentSlug(String(row.payload.agent ?? row.payload.ref ?? row.payload.team ?? "")) ??
      "other";
    if (!byCountry.has(country)) byCountry.set(country, new Map());
    const agents = byCountry.get(country)!;
    const cell = agents.get(agent) ?? emptyWindow();
    if (row.event === "ai_agent_visit") cell.visits += 1;
    if (row.event === "ai_agent_checkout") cell.checkouts += 1;
    if (row.event === "ai_agent_newsletter") cell.newsletters += 1;
    if (row.event === "ai_agent_paid") cell.paid += 1;
    agents.set(agent, cell);
  }
  const rows: CountryTrafficRow[] = [];
  for (const [country, agents] of byCountry) {
    const list: CountryAgentCell[] = [...agents.entries()]
      .map(([agent, window]) => ({ agent, ...window }))
      .sort((a, b) => activityOf(b) - activityOf(a) || a.agent.localeCompare(b.agent));
    const totals = list.reduce(
      (acc, row) => {
        acc.visits += row.visits;
        acc.checkouts += row.checkouts;
        acc.paid += row.paid;
        acc.newsletters += row.newsletters;
        return acc;
      },
      emptyWindow()
    );
    rows.push({
      country,
      locale: GEO_LOCALE_MAP[country] ?? localeFromCountry(country),
      ...totals,
      topAgent: list[0]?.agent ?? null,
      agents: list,
    });
  }
  return rows.sort((a, b) => activityOf(b) - activityOf(a) || a.country.localeCompare(b.country));
}
