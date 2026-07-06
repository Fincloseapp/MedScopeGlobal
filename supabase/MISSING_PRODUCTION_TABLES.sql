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

-- LF1 student materials index (metadata + external links)
create table if not exists public.student_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  rocnik smallint,
  category text not null default 'rocnik'
    check (category in ('recent', 'rocnik', 'general')),
  external_url text not null,
  file_type text,
  file_size_bytes bigint,
  description text,
  source_name text not null default 'LF1.CZ',
  source_url text not null default 'https://lf1.cz/materialy-ke-stazeni/',
  source_attribution text not null default 'Zdroj: LF UK Praha — studentský portál LF1.CZ (lf1.cz). MedScopeGlobal pouze kurátoruje a odkazuje na originál.',
  hosting_mode text not null default 'external_link'
    check (hosting_mode in ('external_link', 'hosted')),
  storage_path text,
  is_active boolean not null default true,
  scraped_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (external_url, rocnik)
);

create index if not exists student_materials_rocnik_idx
  on public.student_materials (rocnik, subject);

create index if not exists student_materials_subject_idx
  on public.student_materials (subject);

create index if not exists student_materials_active_idx
  on public.student_materials (is_active, rocnik);

alter table public.student_materials enable row level security;

drop policy if exists student_materials_public_read on public.student_materials;
create policy student_materials_public_read
  on public.student_materials for select using (is_active = true);

drop policy if exists student_materials_service_write on public.student_materials;
create policy student_materials_service_write
  on public.student_materials for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

notify pgrst, 'reload schema';
