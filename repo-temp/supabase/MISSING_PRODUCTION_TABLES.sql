-- Run once in Supabase SQL Editor if npm run db:apply-pg / db:setup is unavailable
-- https://supabase.com/dashboard/project/xcydgqnivxfhprbmdyym/sql/new

-- Platform tables
create table if not exists public.rubrics (
  slug text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'running',
  triggered_by text not null default 'cron',
  articles_created integer not null default 0,
  articles_skipped integer not null default 0,
  errors jsonb default '[]',
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.ingestion_schedule (
  id int primary key default 1 check (id = 1),
  enabled boolean not null default true,
  interval_hours integer not null default 6,
  max_articles_per_run integer not null default 24,
  last_run_at timestamptz,
  updated_at timestamptz default now()
);

insert into public.ingestion_schedule (id) values (1) on conflict (id) do nothing;

-- Article translations (display locale ≠ article locale)
create table if not exists public.article_translations (
  article_id uuid not null references public.articles (id) on delete cascade,
  locale text not null,
  title text not null,
  excerpt text,
  content text,
  updated_at timestamptz not null default now(),
  primary key (article_id, locale)
);

create index if not exists article_translations_locale_idx
  on public.article_translations (locale);

alter table public.article_translations enable row level security;

drop policy if exists article_translations_select on public.article_translations;
create policy article_translations_select on public.article_translations
  for select using (true);

-- Notify PostgREST to reload schema
notify pgrst, 'reload schema';
