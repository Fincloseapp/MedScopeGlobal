import { createAdminReadClient } from "@/lib/auth/require-admin-access";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import {
  AI_AGENT_SLUGS,
  legalChannels,
  normalizeAiAgentSlug,
  type AiAgentSlug,
} from "@/lib/growth/ai-agent-program";
import {
  addUtcDays,
  evaluateProgramGoals,
  evaluateVisibility,
  sumDailyRange,
  type GoalPace,
} from "@/lib/growth/ai-agent-eval";

export type DailyCount = { date: string; count: number };

export type AgentRow = {
  agent: AiAgentSlug;
  visits: number;
  checkouts: number;
  paid: number;
  newsletters: number;
};

export type AiAgentGrowthSnapshot = {
  loadedAt: string;
  dataSource: "service-role" | "user-session" | "unavailable";
  subscribers: {
    active: number;
    trialing: number;
    totalLive: number;
    newsletter: number;
    vip: number;
  };
  revenue: {
    v27PaidOrders: number;
    v27PaidCzk: number;
  };
  goals: {
    near: GoalPace;
    sep27: GoalPace;
  };
  pace: {
    last7: number;
    dailyAvg7: number;
  };
  visibility: {
    visible: boolean;
    last3: number;
    prev3: number;
    label: string;
  };
  daily: DailyCount[];
  leaderboard: AgentRow[];
  channels: { id: string; label: string }[];
};

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

const ANALYTICS_PAGE = 1000;
const ANALYTICS_MAX = 4_000;

async function loadAnalyticsEvents(
  client: { from: (table: string) => any },
  since: string
): Promise<{ event: string; payload: unknown }[]> {
  const rows: { event: string; payload: unknown }[] = [];
  for (let from = 0; from < ANALYTICS_MAX; from += ANALYTICS_PAGE) {
    const { data, error } = await client
      .from("analytics")
      .select("event, payload, created_at")
      .in("event", ["ai_agent_visit", "ai_agent_checkout", "ai_agent_newsletter", "ai_agent_paid"])
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .range(from, from + ANALYTICS_PAGE - 1);
    if (error || !data?.length) break;
    rows.push(...data);
    if (data.length < ANALYTICS_PAGE) break;
  }
  return rows;
}

async function countSafe(
  query: PromiseLike<{ count: number | null; error: { message: string } | null }>
): Promise<number> {
  try {
    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function countLiveSubscriptions(): Promise<number> {
  const service = tryCreateServiceRoleClient();
  const session = service ? null : await createAdminReadClient().catch(() => null);
  const client = service ?? session;
  if (!client) return 0;
  const [active, trialing] = await Promise.all([
    countSafe(client.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active")),
    countSafe(client.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "trialing")),
  ]);
  return active + trialing;
}

export async function loadAiAgentGrowthSnapshot(): Promise<AiAgentGrowthSnapshot> {
  try {
    return await loadAiAgentGrowthSnapshotUnsafe();
  } catch {
    return buildSnapshot({
      dataSource: "unavailable",
      active: 0,
      trialing: 0,
      newsletter: 0,
      vip: 0,
      paidOrders: 0,
      paidCzk: 0,
      daily: [],
      leaderboard: AI_AGENT_SLUGS.map((agent) => ({
        agent,
        visits: 0,
        checkouts: 0,
        paid: 0,
        newsletters: 0,
      })),
    });
  }
}

async function loadAiAgentGrowthSnapshotUnsafe(): Promise<AiAgentGrowthSnapshot> {
  const service = tryCreateServiceRoleClient();
  const session = service ? null : await createAdminReadClient();
  const client = service ?? session;
  const dataSource = service ? "service-role" : session ? "user-session" : "unavailable";
  const emptyDaily: DailyCount[] = [];
  const emptyBoard: AgentRow[] = AI_AGENT_SLUGS.map((agent) => ({
    agent,
    visits: 0,
    checkouts: 0,
    paid: 0,
    newsletters: 0,
  }));

  if (!client) {
    return buildSnapshot({
      dataSource,
      active: 0,
      trialing: 0,
      newsletter: 0,
      vip: 0,
      paidOrders: 0,
      paidCzk: 0,
      daily: emptyDaily,
      leaderboard: emptyBoard,
    });
  }

  const [active, trialing, newsletter, vip] = await Promise.all([
    countSafe(client.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active")),
    countSafe(client.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "trialing")),
    countSafe(
      client
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true })
        .is("unsubscribed_at", null)
    ),
    countSafe(client.from("vip_subscriptions").select("id", { count: "exact", head: true }).eq("active", true)),
  ]);

  let paidOrders = 0;
  let paidCzk = 0;
  const boardMap = new Map<AiAgentSlug, AgentRow>(
    AI_AGENT_SLUGS.map((agent) => [agent, { agent, visits: 0, checkouts: 0, paid: 0, newsletters: 0 }])
  );

  try {
    const { data } = await client
      .from("v27_orders")
      .select("amount_czk, status, metadata")
      .in("status", ["paid", "completed"])
      .limit(2000);
    const rows = data ?? [];
    paidOrders = rows.length;
    paidCzk = rows.reduce((sum, row) => sum + Number(row.amount_czk ?? 0), 0);
  } catch {
    /* table may be missing */
  }

  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const dailyMap = new Map<string, number>();
  try {
    const { data } = await client
      .from("subscriptions")
      .select("created_at")
      .gte("created_at", since)
      .in("status", ["active", "trialing"])
      .limit(5000);
    for (const row of data ?? []) {
      const key = dayKey(String(row.created_at ?? ""));
      if (!key) continue;
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
    }
  } catch {
    /* ignore */
  }

  try {
    const rows = await loadAnalyticsEvents(client, since);
    for (const row of rows) {
      const payload = (row.payload ?? {}) as Record<string, unknown>;
      const agent = normalizeAiAgentSlug(String(payload.agent ?? payload.ref ?? ""));
      if (!agent) continue;
      const item = boardMap.get(agent);
      if (!item) continue;
      if (row.event === "ai_agent_visit") item.visits += 1;
      if (row.event === "ai_agent_checkout") item.checkouts += 1;
      if (row.event === "ai_agent_newsletter") item.newsletters += 1;
      if (row.event === "ai_agent_paid") item.paid += 1;
    }
  } catch {
    /* analytics may be missing */
  }

  const daily = [...dailyMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const leaderboard = [...boardMap.values()].sort((a, b) => {
    const score = (row: AgentRow) => row.paid * 100 + row.checkouts * 10 + row.newsletters * 5 + row.visits;
    return score(b) - score(a);
  });

  return buildSnapshot({
    dataSource,
    active,
    trialing,
    newsletter,
    vip,
    paidOrders,
    paidCzk,
    daily,
    leaderboard,
  });
}

function buildSnapshot(input: {
  dataSource: AiAgentGrowthSnapshot["dataSource"];
  active: number;
  trialing: number;
  newsletter: number;
  vip: number;
  paidOrders: number;
  paidCzk: number;
  daily: DailyCount[];
  leaderboard: AgentRow[];
}): AiAgentGrowthSnapshot {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const totalLive = input.active + input.trialing;
  const last7from = addUtcDays(today, -6);
  const last7 = sumDailyRange(input.daily, last7from, today);
  const dailyAvg7 = Math.round((last7 / 7) * 10) / 10;
  const goals = evaluateProgramGoals(totalLive, dailyAvg7, now);

  return {
    loadedAt: now.toISOString(),
    dataSource: input.dataSource,
    subscribers: {
      active: input.active,
      trialing: input.trialing,
      totalLive,
      newsletter: input.newsletter,
      vip: input.vip,
    },
    revenue: {
      v27PaidOrders: input.paidOrders,
      v27PaidCzk: input.paidCzk,
    },
    goals,
    pace: {
      last7,
      dailyAvg7,
    },
    visibility: evaluateVisibility(input.daily, today),
    daily: input.daily,
    leaderboard: input.leaderboard,
    channels: legalChannels(),
  };
}
