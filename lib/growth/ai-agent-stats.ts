import { createAdminReadClient } from "@/lib/auth/require-admin-access";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import {
  AI_AGENT_GOAL_NEAR,
  AI_AGENT_GOAL_SEP27,
  AI_AGENT_SLUGS,
  legalChannels,
  normalizeAiAgentSlug,
  type AiAgentSlug,
} from "@/lib/growth/ai-agent-program";

export type DailyCount = { date: string; count: number };

export type AgentRow = {
  agent: AiAgentSlug;
  visits: number;
  checkouts: number;
  paid: number;
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
    near: { target: number; by: string; remaining: number; daysLeft: number; dailyNeeded: number };
    sep27: { target: number; by: string; remaining: number; daysLeft: number; dailyNeeded: number };
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

function daysUntil(iso: string, now = new Date()): number {
  const end = new Date(iso).getTime();
  const diff = end - now.getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function sumRange(daily: DailyCount[], from: string, to: string): number {
  return daily
    .filter((row) => row.date >= from && row.date <= to)
    .reduce((sum, row) => sum + row.count, 0);
}

function addDays(isoDay: string, delta: number): string {
  const d = new Date(`${isoDay}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function visibilityOf(daily: DailyCount[], today: string): AiAgentGrowthSnapshot["visibility"] {
  const last3from = addDays(today, -2);
  const prev3to = addDays(today, -3);
  const prev3from = addDays(today, -5);
  const last3 = sumRange(daily, last3from, today);
  const prev3 = sumRange(daily, prev3from, prev3to);
  if (last3 === 0 && prev3 === 0) {
    return {
      visible: false,
      last3,
      prev3,
      label: "Nárůst zatím není vidět — v posledních 6 dnech nepřibylo žádné nové předplatné.",
    };
  }
  if (last3 > prev3) {
    return {
      visible: true,
      last3,
      prev3,
      label: `Nárůst je vidět: poslední 3 dny ${last3} > předchozí 3 dny ${prev3}.`,
    };
  }
  if (last3 === prev3) {
    return {
      visible: false,
      last3,
      prev3,
      label: `Předplatné přibývají, ale tempo se nemění (${last3} za 3 dny).`,
    };
  }
  return {
    visible: false,
    last3,
    prev3,
    label: `Nárůst není vidět: poslední 3 dny ${last3} < předchozí 3 dny ${prev3}.`,
  };
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

export async function loadAiAgentGrowthSnapshot(): Promise<AiAgentGrowthSnapshot> {
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
    AI_AGENT_SLUGS.map((agent) => [agent, { agent, visits: 0, checkouts: 0, paid: 0 }])
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
    for (const row of rows) {
      const meta = (row.metadata ?? {}) as Record<string, unknown>;
      const agent = normalizeAiAgentSlug(String(meta.ai_ref ?? meta.utm_source ?? ""));
      if (!agent) continue;
      const item = boardMap.get(agent);
      if (item) item.paid += 1;
    }
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
    const { data } = await client
      .from("analytics")
      .select("event, payload, created_at")
      .in("event", ["ai_agent_visit", "ai_agent_checkout"])
      .gte("created_at", since)
      .limit(4000);
    for (const row of data ?? []) {
      const payload = (row.payload ?? {}) as Record<string, unknown>;
      const agent = normalizeAiAgentSlug(String(payload.agent ?? payload.ref ?? ""));
      if (!agent) continue;
      const item = boardMap.get(agent);
      if (!item) continue;
      if (row.event === "ai_agent_visit") item.visits += 1;
      if (row.event === "ai_agent_checkout") item.checkouts += 1;
    }
  } catch {
    /* analytics may be missing */
  }

  const daily = [...dailyMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const leaderboard = [...boardMap.values()].sort((a, b) => {
    const score = (row: AgentRow) => row.paid * 100 + row.checkouts * 10 + row.visits;
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
  const last7from = addDays(today, -6);
  const last7 = sumRange(input.daily, last7from, today);
  const nearDays = daysUntil(AI_AGENT_GOAL_NEAR.by, now);
  const farDays = daysUntil(AI_AGENT_GOAL_SEP27.by, now);
  const nearRemain = Math.max(0, AI_AGENT_GOAL_NEAR.count - totalLive);
  const farRemain = Math.max(0, AI_AGENT_GOAL_SEP27.count - totalLive);

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
    goals: {
      near: {
        target: AI_AGENT_GOAL_NEAR.count,
        by: AI_AGENT_GOAL_NEAR.by,
        remaining: nearRemain,
        daysLeft: nearDays,
        dailyNeeded: nearDays > 0 ? Math.ceil(nearRemain / nearDays) : nearRemain,
      },
      sep27: {
        target: AI_AGENT_GOAL_SEP27.count,
        by: AI_AGENT_GOAL_SEP27.by,
        remaining: farRemain,
        daysLeft: farDays,
        dailyNeeded: farDays > 0 ? Math.ceil(farRemain / farDays) : farRemain,
      },
    },
    pace: {
      last7,
      dailyAvg7: Math.round((last7 / 7) * 10) / 10,
    },
    visibility: visibilityOf(input.daily, today),
    daily: input.daily,
    leaderboard: input.leaderboard,
    channels: legalChannels(),
  };
}
