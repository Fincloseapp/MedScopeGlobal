-- MedScopeGlobal advanced ingest, medical tracks, dedupe, ad analytics, and study metadata

-- Extend articles with advanced ingestion metadata and medical study tracking
alter table public.articles
  add column if not exists hash_dedup text,
  add column if not exists content_type text check (content_type in ('clinical', 'research', 'pharma', 'policy', 'med_prep', 'med_study', 'med_case', 'med_exam_tip')),
  add column if not exists license text default 'unknown',
  add column if not exists is_machine_translated boolean not null default false,
  add column if not exists is_premium boolean not null default false,
  add column if not exists med_track text check (med_track in ('priprava', 'studium')),
  add column if not exists study_year integer check (study_year between 1 and 6),
  add column if not exists prijimacky_topic text,
  add column if not exists reading_time_minutes integer,
  add column if not exists learning_objectives text[] default '{}',
  add column if not exists quiz_json jsonb default '{}'::jsonb,
  add column if not exists parent_article_id uuid references public.articles (id) on delete set null,
  add column if not exists meta_description text;

create unique index if not exists articles_hash_dedup_uidx
  on public.articles (hash_dedup)
  where hash_dedup is not null;

create index if not exists articles_content_type_idx
  on public.articles (content_type);

create index if not exists articles_med_track_idx
  on public.articles (med_track, study_year);

-- Ingestion runs schedule defaults for daily editorial production
create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'running'
    check (status in ('running', 'completed', 'failed')),
  triggered_by text not null default 'cron',
  articles_created integer not null default 0,
  articles_skipped integer not null default 0,
  errors jsonb default '[]'::jsonb,
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
  interval_hours integer not null default 24,
  max_articles_per_run integer not null default 80,
  last_run_at timestamptz,
  updated_at timestamptz default now()
);

insert into public.ingestion_schedule (id, enabled, interval_hours, max_articles_per_run)
values (1, true, 24, 80)
on conflict (id) do nothing;

alter table public.ingestion_schedule enable row level security;

drop policy if exists ingestion_schedule_admin on public.ingestion_schedule;
create policy ingestion_schedule_admin on public.ingestion_schedule
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Additional audience / monetization tables for student and premium flows
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  user_type text not null default 'professional'
    check (user_type in ('priprava_medicina', 'student_mediciny', 'professional', 'advertiser', 'admin')),
  year_of_study integer check (year_of_study between 1 and 6),
  faculty text,
  planned_admission_year text,
  newsletter_opt_in boolean not null default false,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists user_profiles_own on public.user_profiles;
create policy user_profiles_own on public.user_profiles
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists user_profiles_own_update on public.user_profiles;
create policy user_profiles_own_update on public.user_profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists user_profiles_own_insert on public.user_profiles;
create policy user_profiles_own_insert on public.user_profiles
  for insert to authenticated with check (user_id = auth.uid());

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'active'
    check (status in ('active', 'past_due', 'canceled', 'trialing')),
  plan text not null default 'premium',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists subscriptions_own on public.subscriptions;
create policy subscriptions_own on public.subscriptions
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  has_premium boolean not null default false,
  premium_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_entitlements enable row level security;

drop policy if exists user_entitlements_own on public.user_entitlements;
create policy user_entitlements_own on public.user_entitlements
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

create table if not exists public.saved_articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  article_id uuid not null references public.articles (id) on delete cascade,
  folder text not null default 'saved',
  created_at timestamptz not null default now(),
  unique (user_id, article_id)
);

alter table public.saved_articles enable row level security;

drop policy if exists saved_articles_own on public.saved_articles;
create policy saved_articles_own on public.saved_articles
  for select to authenticated using (user_id = auth.uid());

drop policy if exists saved_articles_own_insert on public.saved_articles;
create policy saved_articles_own_insert on public.saved_articles
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists saved_articles_own_delete on public.saved_articles;
create policy saved_articles_own_delete on public.saved_articles
  for delete to authenticated using (user_id = auth.uid());

create table if not exists public.ad_impressions (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads (id) on delete cascade,
  placement text,
  created_at timestamptz not null default now()
);

create table if not exists public.ad_clicks (
  id uuid primary key default gen_random_uuid(),
  ad_id uuid not null references public.ads (id) on delete cascade,
  clicked_at timestamptz not null default now(),
  referrer text
);
