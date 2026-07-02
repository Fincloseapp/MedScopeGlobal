-- MedScopeGlobal — automated ingestion from global medical sources

alter table public.articles
  add column if not exists source_url text,
  add column if not exists source_name text,
  add column if not exists ingested_at timestamptz,
  add column if not exists ai_generated boolean not null default false;

create unique index if not exists articles_source_url_uidx
  on public.articles (source_url)
  where source_url is not null;

create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'running'
    check (status in ('running', 'completed', 'failed')),
  triggered_by text not null default 'cron',
  articles_created integer not null default 0,
  articles_skipped integer not null default 0,
  errors jsonb default '[]',
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

alter table public.ingestion_runs enable row level security;
drop policy if exists ingestion_runs_admin on public.ingestion_runs;
create policy ingestion_runs_admin on public.ingestion_runs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table if not exists public.ingestion_schedule (
  id int primary key default 1 check (id = 1),
  enabled boolean not null default true,
  interval_hours integer not null default 6,
  max_articles_per_run integer not null default 24,
  last_run_at timestamptz,
  updated_at timestamptz default now()
);

insert into public.ingestion_schedule (id, enabled, interval_hours, max_articles_per_run)
values (1, true, 6, 24)
on conflict (id) do nothing;

alter table public.ingestion_schedule enable row level security;
drop policy if exists ingestion_schedule_admin on public.ingestion_schedule;
create policy ingestion_schedule_admin on public.ingestion_schedule
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
