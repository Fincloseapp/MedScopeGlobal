-- V6 Autopilot Engine (additive — does not alter V4–V5+ tables)

-- Alias view: medical_articles → medical_ai_texts (V6 naming)
create or replace view public.medical_articles as
  select * from public.medical_ai_texts;

-- Autopilot run log
create table if not exists public.autopilot_runs (
  id uuid primary key default gen_random_uuid(),
  job_slug text not null,
  status text not null check (status in ('started', 'ok', 'partial', 'error')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  items_processed int not null default 0,
  items_created int not null default 0,
  details jsonb not null default '{}'::jsonb,
  error_message text
);

create index if not exists autopilot_runs_job_idx
  on public.autopilot_runs (job_slug, started_at desc);

-- Regulatory / study / drug alerts
create table if not exists public.autopilot_alerts (
  id uuid primary key default gen_random_uuid(),
  alert_type text not null check (
    alert_type in ('new_study', 'new_drug', 'legislation', 'guideline', 'trend')
  ),
  title text not null,
  summary text,
  source_type text,
  source_id uuid references public.medical_sources(id) on delete set null,
  article_id uuid references public.medical_ai_texts(id) on delete set null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists autopilot_alerts_type_idx
  on public.autopilot_alerts (alert_type, created_at desc);

-- Trend analysis snapshots
create table if not exists public.autopilot_trends (
  id uuid primary key default gen_random_uuid(),
  trend_key text not null,
  period_start date not null,
  period_end date not null,
  metric jsonb not null default '{}'::jsonb,
  narrative text,
  created_at timestamptz not null default now()
);

create index if not exists autopilot_trends_key_idx
  on public.autopilot_trends (trend_key, period_end desc);

-- Zero-touch settings (singleton row id)
create table if not exists public.autopilot_settings (
  id text primary key default 'default',
  zero_touch_enabled boolean not null default true,
  autopublish_enabled boolean not null default true,
  pubmed_monitor_enabled boolean not null default true,
  regulatory_monitor_enabled boolean not null default true,
  trend_analysis_enabled boolean not null default true,
  guideline_update_enabled boolean not null default true,
  notify_email text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.autopilot_settings (id)
values ('default')
on conflict (id) do nothing;

-- Cron job registry (Supabase pg_cron + Vercel mirror)
create table if not exists public.autopilot_cron_jobs (
  slug text primary key,
  schedule text not null,
  edge_function text not null,
  description text,
  last_run_at timestamptz,
  last_status text,
  enabled boolean not null default true
);

insert into public.autopilot_cron_jobs (slug, schedule, edge_function, description)
values
  ('hourly_pubmed_monitor', '0 * * * *', 'pubmed-monitor', 'AI monitoring — PubMed hourly'),
  ('daily_regulatory_monitor', '0 11 * * *', 'regulatory-monitor', 'SÚKL, EMA, FDA daily'),
  ('daily_autopublish', '0 12 * * *', 'autopublish', 'Autopublish medical articles'),
  ('weekly_trend_analysis', '0 13 * * 1', 'trend-analysis', 'RA/DMARD/bDMARD trends'),
  ('monthly_guideline_update', '0 14 1 * *', 'guideline-update', 'Guideline refresh')
on conflict (slug) do update set
  schedule = excluded.schedule,
  edge_function = excluded.edge_function,
  description = excluded.description;

-- Personalization profiles (feeds)
create table if not exists public.autopilot_personalization (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (
    audience in ('lekari', 'pacienti', 'vyzkum', 'legislativa')
  ),
  user_id uuid references auth.users(id) on delete cascade,
  specialty text,
  topics text[] not null default '{}',
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists autopilot_personalization_audience_idx
  on public.autopilot_personalization (audience, updated_at desc);

alter table public.autopilot_runs enable row level security;
alter table public.autopilot_alerts enable row level security;
alter table public.autopilot_trends enable row level security;
alter table public.autopilot_settings enable row level security;
alter table public.autopilot_cron_jobs enable row level security;
alter table public.autopilot_personalization enable row level security;

drop policy if exists autopilot_runs_public_read on public.autopilot_runs;
create policy autopilot_runs_public_read on public.autopilot_runs
  for select using (true);

drop policy if exists autopilot_runs_admin_all on public.autopilot_runs;
create policy autopilot_runs_admin_all on public.autopilot_runs
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists autopilot_alerts_public_read on public.autopilot_alerts;
create policy autopilot_alerts_public_read on public.autopilot_alerts
  for select using (true);

drop policy if exists autopilot_alerts_admin_all on public.autopilot_alerts;
create policy autopilot_alerts_admin_all on public.autopilot_alerts
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists autopilot_trends_public_read on public.autopilot_trends;
create policy autopilot_trends_public_read on public.autopilot_trends
  for select using (true);

drop policy if exists autopilot_trends_admin_all on public.autopilot_trends;
create policy autopilot_trends_admin_all on public.autopilot_trends
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists autopilot_settings_public_read on public.autopilot_settings;
create policy autopilot_settings_public_read on public.autopilot_settings
  for select using (true);

drop policy if exists autopilot_settings_admin_all on public.autopilot_settings;
create policy autopilot_settings_admin_all on public.autopilot_settings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists autopilot_cron_jobs_public_read on public.autopilot_cron_jobs;
create policy autopilot_cron_jobs_public_read on public.autopilot_cron_jobs
  for select using (true);

drop policy if exists autopilot_cron_jobs_admin_all on public.autopilot_cron_jobs;
create policy autopilot_cron_jobs_admin_all on public.autopilot_cron_jobs
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists autopilot_personalization_own on public.autopilot_personalization;
create policy autopilot_personalization_own on public.autopilot_personalization
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

insert into public.documentation (version, content, admin_only)
values (
  'v6',
  'V6 AI Autopilot Engine: zero-touch PubMed/SÚKL/EMA/FDA monitoring, autopublish, trend analysis, dashboard /dashboard, feeds /pro-me/*, /autopilot.',
  false
)
on conflict (version) do update set
  content = excluded.content;
