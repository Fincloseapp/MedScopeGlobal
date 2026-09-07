import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import {
  ARENA_ROLES,
  ARENA_TEAM_SLUGS,
  MESSAGE_LIMIT_DEFAULT,
  REACH_QUOTA_DEFAULT,
  TEAM_SEED,
  type ArenaRole,
  type ArenaSectionId,
  type ArenaTeamSlug,
  type ContentStyle,
  type SocialAccount,
} from "@/lib/growth/arena/config";
import { applyArenaSchema } from "@/lib/growth/arena/schema";

export type TeamRow = {
  slug: ArenaTeamSlug;
  name: string;
  generation: number;
  status: "active" | "terminated" | "disqualified";
  reachQuota: number;
  messageLimit: number;
  teamPoints: number;
  losingStreak: number;
  styleBias: ContentStyle;
  socialAccounts: SocialAccount[];
  milestoneSection3: boolean;
  predictedK: number | null;
  updatedAt: string;
};

export type MemberRow = {
  teamSlug: ArenaTeamSlug;
  role: ArenaRole;
  slug: string;
  points: number;
  status: string;
};

export type KnowledgeRow = {
  id: string;
  teamSlug: ArenaTeamSlug;
  section: ArenaSectionId;
  styleKey: string;
  kFactor: number;
  insight: string;
  createdAt: string;
};

export type MetricRow = {
  teamSlug: ArenaTeamSlug;
  agentRole: string | null;
  section: string | null;
  windowStart: string;
  windowMinutes: number;
  visits: number;
  checkouts: number;
  paid: number;
  newsletters: number;
  ctr: number;
  kFactor: number;
  predictedK: number | null;
  reachUsed: number;
  pointsDelta: number;
  spamFlag: boolean;
  createdAt: string;
};

export type EvolutionLogRow = {
  action: string;
  winnerSlug: string | null;
  loserSlug: string | null;
  detail: string | null;
  createdAt: string;
};

export type BusRow = {
  teamSlug: ArenaTeamSlug;
  fromRole: string;
  toRole: string;
  kind: string;
  body: Record<string, unknown>;
  createdAt: string;
};

function seedTeams(): TeamRow[] {
  const now = new Date().toISOString();
  return ARENA_TEAM_SLUGS.map((slug) => ({
    slug,
    name: TEAM_SEED[slug].name,
    generation: 1,
    status: "active",
    reachQuota: REACH_QUOTA_DEFAULT,
    messageLimit: MESSAGE_LIMIT_DEFAULT,
    teamPoints: 0,
    losingStreak: 0,
    styleBias: TEAM_SEED[slug].styleBias,
    socialAccounts: TEAM_SEED[slug].accounts,
    milestoneSection3: false,
    predictedK: null,
    updatedAt: now,
  }));
}

function seedMembers(): MemberRow[] {
  const rows: MemberRow[] = [];
  for (const team of ARENA_TEAM_SLUGS) {
    for (const role of ARENA_ROLES) {
      rows.push({
        teamSlug: team,
        role,
        slug: `${team}-${role}`,
        points: 0,
        status: "active",
      });
    }
  }
  return rows;
}

const memory = {
  teams: seedTeams(),
  members: seedMembers(),
  knowledge: [] as KnowledgeRow[],
  metrics: [] as MetricRow[],
  evolution: [] as EvolutionLogRow[],
  bus: [] as BusRow[],
};

export function resetArenaMemoryForTests(): void {
  memory.teams = seedTeams();
  memory.members = seedMembers();
  memory.knowledge = [];
  memory.metrics = [];
  memory.evolution = [];
  memory.bus = [];
}

function mapTeam(row: Record<string, unknown>): TeamRow {
  return {
    slug: row.slug as ArenaTeamSlug,
    name: String(row.name),
    generation: Number(row.generation ?? 1),
    status: (row.status as TeamRow["status"]) ?? "active",
    reachQuota: Number(row.reach_quota ?? REACH_QUOTA_DEFAULT),
    messageLimit: Number(row.message_limit ?? MESSAGE_LIMIT_DEFAULT),
    teamPoints: Number(row.team_points ?? 0),
    losingStreak: Number(row.losing_streak ?? 0),
    styleBias: (row.style_bias as ContentStyle) ?? "clinical-short",
    socialAccounts: (row.social_accounts as SocialAccount[]) ?? TEAM_SEED.alfa.accounts,
    milestoneSection3: Boolean(row.milestone_section3),
    predictedK: row.predicted_k == null ? null : Number(row.predicted_k),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

export async function ensureArenaSeeded(): Promise<void> {
  await applyArenaSchema();
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;
  try {
    const { count } = await admin.from("agent_teams").select("id", { count: "exact", head: true });
    if ((count ?? 0) > 0) return;
    await admin.from("agent_teams").insert(
      seedTeams().map((row) => ({
        slug: row.slug,
        name: row.name,
        generation: row.generation,
        status: row.status,
        reach_quota: row.reachQuota,
        message_limit: row.messageLimit,
        team_points: row.teamPoints,
        losing_streak: row.losingStreak,
        style_bias: row.styleBias,
        social_accounts: row.socialAccounts,
      }))
    );
    await admin.from("agent_members").insert(
      seedMembers().map((row) => ({
        team_slug: row.teamSlug,
        role: row.role,
        slug: row.slug,
        points: row.points,
        status: row.status,
      }))
    );
  } catch {
    /* tables may still be missing */
  }
}

export async function loadTeams(): Promise<TeamRow[]> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return memory.teams;
  try {
    const { data, error } = await admin.from("agent_teams").select("*").order("slug");
    if (error || !data?.length) return memory.teams;
    const mapped = data.map((row) => mapTeam(row as Record<string, unknown>));
    memory.teams = mapped;
    return mapped;
  } catch {
    return memory.teams;
  }
}

export async function loadMembers(): Promise<MemberRow[]> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return memory.members;
  try {
    const { data } = await admin.from("agent_members").select("*");
    if (!data?.length) return memory.members;
    memory.members = data.map((row) => ({
      teamSlug: row.team_slug as ArenaTeamSlug,
      role: row.role as ArenaRole,
      slug: String(row.slug),
      points: Number(row.points ?? 0),
      status: String(row.status ?? "active"),
    }));
    return memory.members;
  } catch {
    return memory.members;
  }
}

export async function upsertTeam(row: Partial<TeamRow> & { slug: ArenaTeamSlug }): Promise<void> {
  const current = (await loadTeams()).find((item) => item.slug === row.slug);
  const next: TeamRow = {
    ...(current ?? seedTeams().find((item) => item.slug === row.slug)!),
    ...row,
    updatedAt: new Date().toISOString(),
  };
  memory.teams = memory.teams.map((item) => (item.slug === next.slug ? next : item));
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;
  try {
    await admin.from("agent_teams").upsert(
      {
        slug: next.slug,
        name: next.name,
        generation: next.generation,
        status: next.status,
        reach_quota: next.reachQuota,
        message_limit: next.messageLimit,
        team_points: next.teamPoints,
        losing_streak: next.losingStreak,
        style_bias: next.styleBias,
        social_accounts: next.socialAccounts,
        milestone_section3: next.milestoneSection3,
        predicted_k: next.predictedK,
        updated_at: next.updatedAt,
      },
      { onConflict: "slug" }
    );
  } catch {
    /* ignore */
  }
}

export async function addMemberPoints(team: ArenaTeamSlug, role: ArenaRole, delta: number): Promise<void> {
  memory.members = memory.members.map((row) =>
    row.teamSlug === team && row.role === role ? { ...row, points: row.points + delta } : row
  );
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;
  try {
    const current = memory.members.find((row) => row.teamSlug === team && row.role === role);
    await admin
      .from("agent_members")
      .update({ points: current?.points ?? delta })
      .eq("team_slug", team)
      .eq("role", role);
  } catch {
    /* ignore */
  }
}

export async function writeKnowledge(row: Omit<KnowledgeRow, "id" | "createdAt">): Promise<KnowledgeRow> {
  const saved: KnowledgeRow = {
    ...row,
    id: `mem-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  memory.knowledge.unshift(saved);
  memory.knowledge = memory.knowledge.slice(0, 80);
  const admin = tryCreateServiceRoleClient();
  if (!admin) return saved;
  try {
    const { data } = await admin
      .from("agent_shared_knowledge")
      .insert({
        team_slug: row.teamSlug,
        section: row.section,
        style_key: row.styleKey,
        k_factor: row.kFactor,
        insight: row.insight,
        payload: {},
      })
      .select("id, created_at")
      .maybeSingle();
    if (data?.id) {
      saved.id = String(data.id);
      saved.createdAt = String(data.created_at);
    }
  } catch {
    /* ignore */
  }
  return saved;
}

export async function latestKnowledge(team: ArenaTeamSlug, section?: ArenaSectionId): Promise<KnowledgeRow | null> {
  const admin = tryCreateServiceRoleClient();
  if (admin) {
    try {
      let q = admin
        .from("agent_shared_knowledge")
        .select("*")
        .eq("team_slug", team)
        .order("created_at", { ascending: false })
        .limit(1);
      if (section) q = q.eq("section", section);
      const { data } = await q.maybeSingle();
      if (data) {
        return {
          id: String(data.id),
          teamSlug: data.team_slug as ArenaTeamSlug,
          section: data.section as ArenaSectionId,
          styleKey: String(data.style_key),
          kFactor: Number(data.k_factor),
          insight: String(data.insight),
          createdAt: String(data.created_at),
        };
      }
    } catch {
      /* fall through */
    }
  }
  return (
    memory.knowledge.find((row) => row.teamSlug === team && (!section || row.section === section)) ??
    null
  );
}

export async function listKnowledge(limit = 12): Promise<KnowledgeRow[]> {
  const admin = tryCreateServiceRoleClient();
  if (admin) {
    try {
      const { data } = await admin
        .from("agent_shared_knowledge")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (data?.length) {
        return data.map((row) => ({
          id: String(row.id),
          teamSlug: row.team_slug as ArenaTeamSlug,
          section: row.section as ArenaSectionId,
          styleKey: String(row.style_key),
          kFactor: Number(row.k_factor),
          insight: String(row.insight),
          createdAt: String(row.created_at),
        }));
      }
    } catch {
      /* ignore */
    }
  }
  return memory.knowledge.slice(0, limit);
}

export async function writeMetric(row: Omit<MetricRow, "createdAt">): Promise<void> {
  const saved: MetricRow = { ...row, createdAt: new Date().toISOString() };
  memory.metrics.unshift(saved);
  memory.metrics = memory.metrics.slice(0, 200);
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;
  try {
    await admin.from("ai_agent_metrics").insert({
      team_slug: row.teamSlug,
      agent_role: row.agentRole,
      section: row.section,
      window_start: row.windowStart,
      window_minutes: row.windowMinutes,
      visits: row.visits,
      checkouts: row.checkouts,
      paid: row.paid,
      newsletters: row.newsletters,
      ctr: row.ctr,
      k_factor: row.kFactor,
      predicted_k: row.predictedK,
      reach_used: row.reachUsed,
      points_delta: row.pointsDelta,
      spam_flag: row.spamFlag,
    });
  } catch {
    /* ignore */
  }
}

export async function listMetrics(limit = 24, role?: string): Promise<MetricRow[]> {
  const admin = tryCreateServiceRoleClient();
  if (admin) {
    try {
      let q = admin
        .from("ai_agent_metrics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (role) q = q.eq("agent_role", role);
      const { data } = await q;
      if (data?.length) {
        return data.map((row) => ({
          teamSlug: row.team_slug as ArenaTeamSlug,
          agentRole: row.agent_role ? String(row.agent_role) : null,
          section: row.section ? String(row.section) : null,
          windowStart: String(row.window_start),
          windowMinutes: Number(row.window_minutes ?? 60),
          visits: Number(row.visits ?? 0),
          checkouts: Number(row.checkouts ?? 0),
          paid: Number(row.paid ?? 0),
          newsletters: Number(row.newsletters ?? 0),
          ctr: Number(row.ctr ?? 0),
          kFactor: Number(row.k_factor ?? 0),
          predictedK: row.predicted_k == null ? null : Number(row.predicted_k),
          reachUsed: Number(row.reach_used ?? 0),
          pointsDelta: Number(row.points_delta ?? 0),
          spamFlag: Boolean(row.spam_flag),
          createdAt: String(row.created_at),
        }));
      }
    } catch {
      /* ignore */
    }
  }
  return memory.metrics.slice(0, limit);
}

export async function writeBus(row: Omit<BusRow, "createdAt">): Promise<void> {
  memory.bus.unshift({ ...row, createdAt: new Date().toISOString() });
  memory.bus = memory.bus.slice(0, 80);
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;
  try {
    await admin.from("agent_bus").insert({
      team_slug: row.teamSlug,
      from_role: row.fromRole,
      to_role: row.toRole,
      kind: row.kind,
      body: row.body,
    });
  } catch {
    /* ignore */
  }
}

export async function listBus(limit = 20): Promise<BusRow[]> {
  const admin = tryCreateServiceRoleClient();
  if (admin) {
    try {
      const { data } = await admin
        .from("agent_bus")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (data?.length) {
        return data.map((row) => ({
          teamSlug: row.team_slug as ArenaTeamSlug,
          fromRole: String(row.from_role),
          toRole: String(row.to_role),
          kind: String(row.kind),
          body: (row.body ?? {}) as Record<string, unknown>,
          createdAt: String(row.created_at),
        }));
      }
    } catch {
      /* ignore */
    }
  }
  return memory.bus.slice(0, limit);
}

export async function writeEvolution(row: Omit<EvolutionLogRow, "createdAt">): Promise<void> {
  memory.evolution.unshift({ ...row, createdAt: new Date().toISOString() });
  const admin = tryCreateServiceRoleClient();
  if (!admin) return;
  try {
    await admin.from("agent_evolution_log").insert({
      action: row.action,
      winner_slug: row.winnerSlug,
      loser_slug: row.loserSlug,
      detail: row.detail,
    });
  } catch {
    /* ignore */
  }
}

export async function listEvolution(limit = 12): Promise<EvolutionLogRow[]> {
  const admin = tryCreateServiceRoleClient();
  if (admin) {
    try {
      const { data } = await admin
        .from("agent_evolution_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (data?.length) {
        return data.map((row) => ({
          action: String(row.action),
          winnerSlug: row.winner_slug ? String(row.winner_slug) : null,
          loserSlug: row.loser_slug ? String(row.loser_slug) : null,
          detail: row.detail ? String(row.detail) : null,
          createdAt: String(row.created_at),
        }));
      }
    } catch {
      /* ignore */
    }
  }
  return memory.evolution.slice(0, limit);
}
