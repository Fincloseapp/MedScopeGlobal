-- MedScopeGlobal — Security, medical entities, AI logs (V4a extension)
-- ADDITIVE ONLY — does not drop or alter existing tables destructively

-- ---------------------------------------------------------------------------
-- security_logs
-- ---------------------------------------------------------------------------
create table if not exists public.security_logs (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  ip text,
  user_id uuid references auth.users (id) on delete set null,
  action text not null,
  status text not null check (status in ('ok', 'blocked', 'warning', 'error')),
  details jsonb not null default '{}'::jsonb
);

create index if not exists security_logs_timestamp_idx on public.security_logs (timestamp desc);
create index if not exists security_logs_action_idx on public.security_logs (action);
create index if not exists security_logs_user_id_idx on public.security_logs (user_id);

alter table public.security_logs enable row level security;

drop policy if exists "security_logs admin read" on public.security_logs;
create policy "security_logs admin read"
  on public.security_logs for select
  using (public.is_admin());

-- service role inserts only (no client write policy)

-- ---------------------------------------------------------------------------
-- login_attempts (anti-bruteforce)
-- ---------------------------------------------------------------------------
create table if not exists public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  email text,
  fingerprint text,
  success boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists login_attempts_ip_created_idx
  on public.login_attempts (ip, created_at desc);
create index if not exists login_attempts_email_created_idx
  on public.login_attempts (email, created_at desc);

alter table public.login_attempts enable row level security;
-- no client policies — service role only

-- ---------------------------------------------------------------------------
-- rate_limits (persistent counters for Edge Functions / API)
-- ---------------------------------------------------------------------------
create table if not exists public.rate_limits (
  key text primary key,
  count int not null default 0,
  window_start timestamptz not null default now(),
  window_ms int not null default 60000
);

alter table public.rate_limits enable row level security;
-- service role only

create or replace function public.check_rate_limit(
  p_key text,
  p_limit int,
  p_window_ms int default 60000
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.rate_limits%rowtype;
  v_now timestamptz := now();
begin
  select * into v_row from public.rate_limits where key = p_key for update;

  if not found or v_now >= v_row.window_start + (v_row.window_ms || ' milliseconds')::interval then
    insert into public.rate_limits (key, count, window_start, window_ms)
    values (p_key, 1, v_now, p_window_ms)
    on conflict (key) do update
      set count = 1, window_start = v_now, window_ms = p_window_ms;
    return jsonb_build_object('ok', true, 'remaining', p_limit - 1);
  end if;

  if v_row.count >= p_limit then
    return jsonb_build_object(
      'ok', false,
      'remaining', 0,
      'retry_after_ms', extract(epoch from (v_row.window_start + (v_row.window_ms || ' milliseconds')::interval - v_now)) * 1000
    );
  end if;

  update public.rate_limits set count = count + 1 where key = p_key;
  return jsonb_build_object('ok', true, 'remaining', p_limit - v_row.count - 1);
end;
$$;

-- ---------------------------------------------------------------------------
-- ai_agent_logs
-- ---------------------------------------------------------------------------
create table if not exists public.ai_agent_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  agent text not null,
  prompt_hash text,
  tokens_used int,
  status text not null default 'ok',
  toxicity_score numeric(5,4),
  spam_score numeric(5,4),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_agent_logs_user_created_idx
  on public.ai_agent_logs (user_id, created_at desc);

alter table public.ai_agent_logs enable row level security;

drop policy if exists "ai_agent_logs admin read" on public.ai_agent_logs;
create policy "ai_agent_logs admin read"
  on public.ai_agent_logs for select
  using (public.is_admin());

-- pipeline (service role) writes — no client insert policy

-- ---------------------------------------------------------------------------
-- diagnoses (Diagnózy)
-- ---------------------------------------------------------------------------
create table if not exists public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icd_code text,
  description text,
  symptoms text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.diagnoses enable row level security;

drop policy if exists "diagnoses public read" on public.diagnoses;
create policy "diagnoses public read"
  on public.diagnoses for select
  using (published = true or public.is_admin());

drop policy if exists "diagnoses admin write" on public.diagnoses;
create policy "diagnoses admin write"
  on public.diagnoses for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- drugs (Léky)
-- ---------------------------------------------------------------------------
create table if not exists public.drugs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  atc_code text,
  description text,
  indications text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.drugs enable row level security;

drop policy if exists "drugs public read" on public.drugs;
create policy "drugs public read"
  on public.drugs for select
  using (published = true or public.is_admin());

drop policy if exists "drugs admin write" on public.drugs;
create policy "drugs admin write"
  on public.drugs for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- studies (Studie) — separate from articles
-- ---------------------------------------------------------------------------
create table if not exists public.studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  abstract text,
  doi text,
  pubmed_id text,
  journal text,
  published_date date,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.studies enable row level security;

drop policy if exists "studies public read" on public.studies;
create policy "studies public read"
  on public.studies for select
  using (published = true or public.is_admin());

drop policy if exists "studies pipeline write" on public.studies;
create policy "studies pipeline write"
  on public.studies for insert
  with check (public.is_admin());

drop policy if exists "studies pipeline update" on public.studies;
create policy "studies pipeline update"
  on public.studies for update
  using (public.is_admin());

drop policy if exists "studies admin delete" on public.studies;
create policy "studies admin delete"
  on public.studies for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- registration throttle tracking
-- ---------------------------------------------------------------------------
create table if not exists public.registration_events (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  email_domain text,
  created_at timestamptz not null default now()
);

create index if not exists registration_events_ip_created_idx
  on public.registration_events (ip, created_at desc);

alter table public.registration_events enable row level security;

-- ---------------------------------------------------------------------------
-- email domain lists
-- ---------------------------------------------------------------------------
create table if not exists public.email_domain_rules (
  domain text primary key,
  rule text not null check (rule in ('allow', 'deny')),
  reason text,
  created_at timestamptz not null default now()
);

alter table public.email_domain_rules enable row level security;

drop policy if exists "email_domain_rules admin" on public.email_domain_rules;
create policy "email_domain_rules admin"
  on public.email_domain_rules for all
  using (public.is_admin())
  with check (public.is_admin());

-- seed common disposable domains (deny)
insert into public.email_domain_rules (domain, rule, reason) values
  ('mailinator.com', 'deny', 'disposable'),
  ('guerrillamail.com', 'deny', 'disposable'),
  ('tempmail.com', 'deny', 'disposable'),
  ('10minutemail.com', 'deny', 'disposable'),
  ('yopmail.com', 'deny', 'disposable'),
  ('throwaway.email', 'deny', 'disposable')
on conflict (domain) do nothing;

-- ---------------------------------------------------------------------------
-- images RLS extension (media table already exists — reinforce policies)
-- ---------------------------------------------------------------------------
drop policy if exists "media public read" on public.media;
create policy "media public read"
  on public.media for select
  using (true);

drop policy if exists "media admin write" on public.media;
create policy "media admin write"
  on public.media for all
  using (public.is_admin())
  with check (public.is_admin());
