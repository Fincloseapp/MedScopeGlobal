-- Align existing Supabase project schema with MedScopeGlobal app

-- Articles: map legacy columns (summary, cover_image, image_url)
alter table public.articles add column if not exists excerpt text;
update public.articles set excerpt = summary where excerpt is null and summary is not null;

alter table public.articles add column if not exists cover_image_url text;
update public.articles
set cover_image_url = coalesce(cover_image, image_url)
where cover_image_url is null;

alter table public.articles add column if not exists vip_only boolean not null default false;
alter table public.articles add column if not exists updated_at timestamptz;
update public.articles set updated_at = created_at where updated_at is null;

alter table public.articles add column if not exists rubric_slug text;
alter table public.articles add column if not exists min_access_level text not null default 'public';
alter table public.articles add column if not exists locale text not null default 'cs';

alter table public.articles add column if not exists source_url text;
alter table public.articles add column if not exists source_name text;
alter table public.articles add column if not exists ingested_at timestamptz;
alter table public.articles add column if not exists ai_generated boolean not null default false;

create unique index if not exists articles_source_url_uidx
  on public.articles (source_url) where source_url is not null;

-- Users extensions (from platform migration)
alter table public.users
  add column if not exists access_level text not null default 'public',
  add column if not exists profession text,
  add column if not exists verification_status text not null default 'pending',
  add column if not exists verification_document_url text,
  add column if not exists preferred_locale text not null default 'cs',
  add column if not exists preferred_region text not null default 'EU';

do $$ begin
  alter table public.users add constraint users_access_level_check
    check (access_level in ('public', 'student', 'physician'));
exception when duplicate_object then null;
end $$;

do $$ begin
  alter table public.users add constraint users_verification_status_check
    check (verification_status in ('pending', 'ai_review', 'approved', 'rejected'));
exception when duplicate_object then null;
end $$;

-- Rubrics + platform tables (idempotent)
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
