import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import {
  K_FACTOR_SHARE_THRESHOLD,
  type ArenaSectionId,
  type ArenaTeamSlug,
} from "@/lib/growth/arena/config";
import { estimateKFactor, type ConversionWindow } from "@/lib/growth/arena/metrics";
import { isArenaTeamSlug } from "@/lib/growth/arena/config";

export type AnalystReport = {
  team: ArenaTeamSlug;
  window: ConversionWindow;
  section3Users: number;
  kFactor: number;
  shareWorthy: boolean;
  insight: string | null;
  styleHint: string;
};

function emptyWindow(): ConversionWindow {
  return { visits: 0, checkouts: 0, paid: 0, newsletters: 0 };
}

export async function loadTeamWindow(
  team: ArenaTeamSlug,
  sinceIso: string
): Promise<ConversionWindow> {
  const admin = tryCreateServiceRoleClient();
  const window = emptyWindow();
  if (!admin) return window;
  try {
    const { data } = await admin
      .from("analytics")
      .select("event, payload")
      .in("event", ["ai_agent_visit", "ai_agent_checkout", "ai_agent_newsletter", "ai_agent_paid"])
      .gte("created_at", sinceIso)
      .limit(2000);
    for (const row of data ?? []) {
      const payload = (row.payload ?? {}) as Record<string, unknown>;
      const agent = String(payload.agent ?? payload.ref ?? payload.team ?? "");
      if (!agent.includes(team) && payload.team !== team) continue;
      if (row.event === "ai_agent_visit") window.visits += 1;
      if (row.event === "ai_agent_checkout") window.checkouts += 1;
      if (row.event === "ai_agent_newsletter") window.newsletters += 1;
      if (row.event === "ai_agent_paid") window.paid += 1;
    }
  } catch {
    /* analytics optional */
  }
  return window;
}

export async function countSection3Users(team: ArenaTeamSlug): Promise<number> {
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
      const agent = String(payload.agent ?? payload.team ?? "");
      const section = String(payload.section ?? "vialongevita") as ArenaSectionId;
      if ((agent.includes(team) || payload.team === team) && section === "vialongevita") n += 1;
    }
    return n;
  } catch {
    return 0;
  }
}

export async function runAnalyst(
  team: ArenaTeamSlug,
  sinceIso: string
): Promise<AnalystReport> {
  const window = await loadTeamWindow(team, sinceIso);
  const kFactor = estimateKFactor(window);
  const section3Users = await countSection3Users(team);
  const shareWorthy = kFactor >= K_FACTOR_SHARE_THRESHOLD;
  const styleHint =
    window.checkouts > window.visits * 0.2 ? "clinical-short" : "prevention-habit";
  return {
    team,
    window,
    section3Users,
    kFactor,
    shareWorthy,
    styleHint,
    insight: shareWorthy
      ? `Sekce ViaLongeVita: K=${kFactor} za okno (návštěvy ${window.visits}, checkout ${window.checkouts}, paid ${window.paid}). Content má držet styl ${styleHint}.`
      : null,
  };
}

export function isTeamEventAgent(agent: string, team: ArenaTeamSlug): boolean {
  return agent === team || agent.startsWith(`${team}-`) || isArenaTeamSlug(agent) && agent === team;
}
