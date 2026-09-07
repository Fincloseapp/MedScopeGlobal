import { createAdminReadClient } from "@/lib/auth/require-admin-access";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import {
  K_FACTOR_SHARE_THRESHOLD,
  type ArenaTeamSlug,
} from "@/lib/growth/arena/config";
import { estimateKFactor } from "@/lib/growth/arena/metrics";
import {
  emptyWindow,
  eventEditionLocale,
  eventMatchesTeam,
  windowFromEvents,
  type ArenaAnalyticsEvent,
} from "@/lib/growth/arena/markets";

export type AnalystReport = {
  team: ArenaTeamSlug;
  locale: string | null;
  window: ReturnType<typeof emptyWindow>;
  section3Users: number;
  kFactor: number;
  shareWorthy: boolean;
  insight: string | null;
  styleHint: string;
};

export async function loadArenaEvents(sinceIso: string): Promise<ArenaAnalyticsEvent[]> {
  let admin = tryCreateServiceRoleClient();
  if (!admin) {
    try {
      admin = await createAdminReadClient();
    } catch {
      admin = null;
    }
  }
  if (!admin) return [];
  try {
    const rows: { event: unknown; payload: unknown }[] = [];
    const page = 1000;
    for (let from = 0; from < 12_000; from += page) {
      const { data, error } = await admin
        .from("analytics")
        .select("event, payload")
        .in("event", ["ai_agent_visit", "ai_agent_checkout", "ai_agent_newsletter", "ai_agent_paid"])
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .range(from, from + page - 1);
      if (error || !data?.length) break;
      rows.push(...data);
      if (data.length < page) break;
    }
    return rows.map((row) => ({
      event: String(row.event),
      payload: (row.payload ?? {}) as Record<string, unknown>,
    }));
  } catch {
    return [];
  }
}

export async function loadTeamWindow(
  team: ArenaTeamSlug,
  sinceIso: string,
  locale?: string | null
) {
  const events = await loadArenaEvents(sinceIso);
  return windowFromEvents(events, team, locale);
}

export async function countSection3Users(team: ArenaTeamSlug, locale?: string | null): Promise<number> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return 0;
  try {
    const { data } = await admin
      .from("analytics")
      .select("event, payload")
      .eq("event", "ai_agent_paid")
      .limit(4000);
    let n = 0;
    for (const row of data ?? []) {
      const payload = (row.payload ?? {}) as Record<string, unknown>;
      if (!eventMatchesTeam(payload, team)) continue;
      if (locale && eventEditionLocale(payload) !== locale) continue;
      n += 1;
    }
    return n;
  } catch {
    return 0;
  }
}

export function reportFromWindow(
  team: ArenaTeamSlug,
  window: ReturnType<typeof emptyWindow>,
  section3Users: number,
  locale?: string | null
): AnalystReport {
  const kFactor = estimateKFactor(window);
  const shareWorthy = kFactor >= K_FACTOR_SHARE_THRESHOLD;
  const styleHint =
    window.checkouts > window.visits * 0.2 ? "clinical-short" : "prevention-habit";
  const edition = locale ? `mutace ${locale}` : "ViaLongeVita";
  return {
    team,
    locale: locale ?? null,
    window,
    section3Users,
    kFactor,
    shareWorthy,
    styleHint,
    insight: shareWorthy
      ? `${edition}: K=${kFactor} (návštěvy ${window.visits}, checkout ${window.checkouts}, paid ${window.paid}). Styl ${styleHint}.`
      : null,
  };
}

export async function runAnalyst(
  team: ArenaTeamSlug,
  sinceIso: string,
  locale?: string | null
): Promise<AnalystReport> {
  const window = await loadTeamWindow(team, sinceIso, locale);
  const section3Users = await countSection3Users(team, locale);
  return reportFromWindow(team, window, section3Users, locale);
}
