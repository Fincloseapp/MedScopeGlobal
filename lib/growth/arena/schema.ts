import { runManagementQuery } from "@/lib/supabase/management-api";

export const ARENA_SCHEMA_SQL = `
create table if not exists public.agent_teams (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  generation int not null default 1,
  status text not null default 'active',
  parent_slug text,
  reach_quota int not null default 24,
  message_limit int not null default 20,
  team_points int not null default 0,
  losing_streak int not null default 0,
  style_bias text not null default 'clinical-short',
  social_accounts jsonb not null default '[]'::jsonb,
  milestone_section3 boolean not null default false,
  predicted_k numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_members (
  id uuid primary key default gen_random_uuid(),
  team_slug text not null,
  role text not null,
  slug text not null,
  points int not null default 0,
  status text not null default 'active',
  unique (team_slug, role)
);

create table if not exists public.agent_shared_knowledge (
  id uuid primary key default gen_random_uuid(),
  team_slug text not null,
  section text not null,
  style_key text not null,
  k_factor numeric not null,
  insight text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists agent_shared_knowledge_team_time
  on public.agent_shared_knowledge (team_slug, created_at desc);

create table if not exists public.ai_agent_metrics (
  id uuid primary key default gen_random_uuid(),
  team_slug text not null,
  agent_role text,
  section text,
  window_start timestamptz not null,
  window_minutes int not null default 60,
  visits int not null default 0,
  checkouts int not null default 0,
  paid int not null default 0,
  newsletters int not null default 0,
  ctr numeric not null default 0,
  k_factor numeric not null default 0,
  predicted_k numeric,
  reach_used int not null default 0,
  points_delta int not null default 0,
  spam_flag boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists ai_agent_metrics_team_time
  on public.ai_agent_metrics (team_slug, created_at desc);

create table if not exists public.agent_bus (
  id uuid primary key default gen_random_uuid(),
  team_slug text not null,
  from_role text not null,
  to_role text not null,
  kind text not null,
  body jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_evolution_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  winner_slug text,
  loser_slug text,
  detail text,
  created_at timestamptz not null default now()
);
`;

export type SchemaApplyResult = { ok: boolean; skipped?: boolean; error?: string };

let schemaReady = false;

export async function applyArenaSchema(): Promise<SchemaApplyResult> {
  if (schemaReady) return { ok: true, skipped: true };
  const outcome = await runManagementQuery(ARENA_SCHEMA_SQL);
  if (outcome.ok) {
    schemaReady = true;
    return { ok: true };
  }
  if (/already exists|duplicate/i.test(outcome.message)) {
    schemaReady = true;
    return { ok: true, skipped: true };
  }
  return { ok: false, error: outcome.message };
}

export function markArenaSchemaReady(): void {
  schemaReady = true;
}
