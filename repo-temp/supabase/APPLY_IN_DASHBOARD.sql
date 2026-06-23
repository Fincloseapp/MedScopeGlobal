-- 20240525000000_initial_schema.sql

-- MedScopeGlobal â€” initial schema, RLS, storage, and auth hooks
-- Run in Supabase SQL Editor or: supabase db push

-- Extensions
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  cover_image_url text,
  category_id uuid not null references public.categories (id) on delete restrict,
  author_id uuid references public.users (id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  vip_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists articles_published_at_idx
  on public.articles (published, published_at desc nulls last);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  public_url text not null,
  mime_type text,
  uploaded_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  link_url text,
  active boolean not null default true,
  placement text,
  created_at timestamptz not null default now()
);

create index if not exists ads_active_idx on public.ads (active);

create table if not exists public.vip_subscriptions (
  user_id uuid primary key references public.users (id) on delete cascade,
  active boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  body text,
  read boolean not null default false,
  priority boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  data jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Auth: mirror auth.users â†’ public.users
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      split_part(coalesce(new.email, 'reader'), '@', 1)
    ),
    'user'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.users.full_name, excluded.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.media enable row level security;
alter table public.ads enable row level security;
alter table public.vip_subscriptions enable row level security;
alter table public.notifications enable row level security;
alter table public.logs enable row level security;

-- users
drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.users where id = auth.uid()));

-- categories
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select using (true);

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- articles
drop policy if exists articles_public_read on public.articles;
create policy articles_public_read on public.articles
  for select using (published = true or public.is_admin());

drop policy if exists articles_admin_write on public.articles;
create policy articles_admin_write on public.articles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- media
drop policy if exists media_admin_all on public.media;
create policy media_admin_all on public.media
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ads
drop policy if exists ads_public_read on public.ads;
create policy ads_public_read on public.ads
  for select using (active = true or public.is_admin());

drop policy if exists ads_admin_write on public.ads;
create policy ads_admin_write on public.ads
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- vip_subscriptions
drop policy if exists vip_select_own on public.vip_subscriptions;
create policy vip_select_own on public.vip_subscriptions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- notifications
drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- logs: no client policies (service role only)

-- ---------------------------------------------------------------------------
-- Storage bucket: media
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists media_storage_public_read on storage.objects;
create policy media_storage_public_read on storage.objects
  for select
  using (bucket_id = 'media');

drop policy if exists media_storage_admin_write on storage.objects;
create policy media_storage_admin_write on storage.objects
  for all to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());



-- 20240525000001_magazine_platform.sql

-- MedScopeGlobal â€” platform extensions (access levels, rubrics, billing, ads)

-- User profile extensions
alter table public.users
  add column if not exists access_level text not null default 'public'
    check (access_level in ('public', 'student', 'physician')),
  add column if not exists profession text,
  add column if not exists verification_status text not null default 'pending'
    check (verification_status in ('pending', 'ai_review', 'approved', 'rejected')),
  add column if not exists verification_document_url text,
  add column if not exists preferred_locale text not null default 'cs',
  add column if not exists preferred_region text not null default 'EU';

-- Article extensions
alter table public.articles
  add column if not exists rubric_slug text,
  add column if not exists min_access_level text not null default 'public'
    check (min_access_level in ('public', 'student', 'physician')),
  add column if not exists locale text not null default 'cs';

create index if not exists articles_access_idx
  on public.articles (published, min_access_level, locale);

-- Rubrics reference
create table if not exists public.rubrics (
  slug text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.rubrics enable row level security;
drop policy if exists rubrics_public_read on public.rubrics;
create policy rubrics_public_read on public.rubrics for select using (true);
drop policy if exists rubrics_admin_write on public.rubrics;
create policy rubrics_admin_write on public.rubrics
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Licences / Stripe subscriptions
create table if not exists public.licences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  plan text not null check (plan in ('basic', 'vip', 'yearly')),
  status text not null default 'trialing'
    check (status in ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists licences_user_idx on public.licences (user_id);

alter table public.licences enable row level security;
drop policy if exists licences_own on public.licences;
create policy licences_own on public.licences
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  licence_id uuid references public.licences (id) on delete set null,
  amount_czk integer,
  currency text default 'CZK',
  stripe_payment_intent_id text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;

-- Ad campaigns (AI advertising engine)
create table if not exists public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser_email text not null,
  advertiser_name text,
  company text,
  status text not null default 'PENDING_APPROVAL'
    check (status in (
      'PENDING_APPROVAL', 'APPROVED', 'PAYMENT_PENDING', 'PAID',
      'ACTIVE', 'FINISHED', 'REJECTED'
    )),
  region text default 'EU',
  locale text default 'cs',
  duration_days integer,
  price_czk integer,
  free_subscriptions_granted integer default 0,
  stripe_payment_link text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.ad_campaigns enable row level security;
drop policy if exists ad_campaigns_admin on public.ad_campaigns;
create policy ad_campaigns_admin on public.ad_campaigns
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table if not exists public.ad_assets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.ad_campaigns (id) on delete cascade,
  image_url text,
  copy_text text,
  locale text,
  created_at timestamptz not null default now()
);

create table if not exists public.ad_reports (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.ad_campaigns (id) on delete cascade,
  impressions integer default 0,
  clicks integer default 0,
  report_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.free_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  campaign_id uuid references public.ad_campaigns (id) on delete set null,
  active boolean not null default true,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.free_subscriptions enable row level security;
drop policy if exists free_subs_own on public.free_subscriptions;
create policy free_subs_own on public.free_subscriptions
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- Analytics stub
create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  user_id uuid references public.users (id) on delete set null,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- Personalization stubs
create table if not exists public.personalization (
  user_id uuid primary key references public.users (id) on delete cascade,
  feed_preferences jsonb default '{}',
  updated_at timestamptz default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  article_id uuid references public.articles (id) on delete cascade,
  score numeric,
  created_at timestamptz not null default now()
);



-- 20240525000002_ingestion.sql

-- MedScopeGlobal â€” automated ingestion from global medical sources

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



-- 20240525000003_align_legacy.sql

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



-- MedScopeGlobal â€” medical categories & rubrics (run after migrations)

insert into public.rubrics (slug, name) values
  ('ai-study-summary', 'AI shrnutĂ­ studiĂ­'),
  ('ai-guideline-summary', 'AI shrnutĂ­ guidelines'),
  ('ai-textbook-summary', 'AI shrnutĂ­ uÄŤebnic'),
  ('ai-diagnostic-algorithm', 'AI diagnostickĂ© algoritmy'),
  ('ai-treatment-recommendation', 'AI lĂ©ÄŤebnĂˇ doporuÄŤenĂ­'),
  ('ai-case-study', 'AI kazuistiky'),
  ('ai-quiz', 'AI testovĂ© otĂˇzky'),
  ('ai-mini-quiz', 'AI mini-kvĂ­zy'),
  ('ai-checklist', 'AI klinickĂ© checklisty'),
  ('ai-step-by-step', 'AI postupy krok za krokem'),
  ('ai-differential', 'AI diferenciĂˇlnĂ­ diagnostika'),
  ('ai-treatment-plan', 'AI lĂ©ÄŤebnĂ© plĂˇny'),
  ('ai-patient-education', 'AI edukace pro pacienty')
on conflict (slug) do nothing;

insert into public.categories (name, slug, description) values
  ('VĹˇeobecnĂ© lĂ©kaĹ™stvĂ­', 'general-practice', 'General practice and primary care'),
  ('Interna', 'internal-medicine', 'Internal medicine'),
  ('Kardiologie', 'cardiology', 'Cardiology'),
  ('Endokrinologie / Diabetologie', 'endocrinology', 'Endocrinology and diabetology'),
  ('Revmatologie', 'rheumatology', 'Rheumatology'),
  ('Onkologie', 'oncology', 'Oncology'),
  ('Neurologie', 'neurology', 'Neurology'),
  ('Pneumologie', 'pulmonology', 'Pulmonology'),
  ('Dermatologie', 'dermatology', 'Dermatology'),
  ('Gastroenterologie', 'gastroenterology', 'Gastroenterology'),
  ('InfekÄŤnĂ­ medicĂ­na', 'infectious-disease', 'Infectious disease'),
  ('Psychiatrie', 'psychiatry', 'Psychiatry'),
  ('Alergologie / Imunologie', 'allergy-immunology', 'Allergy and immunology'),
  ('Ortopedie', 'orthopedics', 'Orthopedics'),
  ('Chirurgie', 'surgery', 'Surgery'),
  ('Pediatrie', 'pediatrics', 'Pediatrics'),
  ('UrgentnĂ­ medicĂ­na', 'emergency-medicine', 'Emergency medicine'),
  ('Studium medicĂ­ny', 'medical-education', 'Medical education'),
  ('MladĂ­ lĂ©kaĹ™i / rezidenti', 'residents', 'Residents and junior doctors'),
  ('OÄŤnĂ­ lĂ©kaĹ™stvĂ­', 'ophthalmology', 'Ophthalmology'),
  ('Glaukom', 'glaucoma', 'Glaucoma'),
  ('Katarakta', 'cataract', 'Cataract'),
  ('MakulĂˇrnĂ­ degenerace', 'macular-degeneration', 'Macular degeneration'),
  ('DiabetickĂˇ retinopatie', 'diabetic-retinopathy', 'Diabetic retinopathy'),
  ('RefrakÄŤnĂ­ vady', 'refractive-disorders', 'Refractive disorders'),
  ('OÄŤnĂ­ chirurgie', 'ocular-surgery', 'Ocular surgery'),
  ('OÄŤnĂ­ farmakologie', 'ocular-pharmacology', 'Ocular pharmacology')
on conflict (slug) do nothing;

-- 20240525000004_article_translations.sql
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

