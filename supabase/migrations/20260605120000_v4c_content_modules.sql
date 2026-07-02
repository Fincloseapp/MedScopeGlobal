-- V4c: Studie, léky, legislativa, digital health, novinky, newsletter, dokumentace (additive)

alter table public.studies add column if not exists source_url text;
alter table public.studies add column if not exists source_name text;
alter table public.studies add column if not exists region text default 'cz';
alter table public.studies add column if not exists specialty text default 'rheumatology';
alter table public.studies add column if not exists summary text;
alter table public.studies add column if not exists image_url text;
alter table public.studies add column if not exists ai_metadata jsonb;
alter table public.studies add column if not exists archived boolean not null default false;
alter table public.studies add column if not exists featured boolean not null default false;

create index if not exists studies_list_idx
  on public.studies (published, archived, published_date desc nulls last, created_at desc);

alter table public.drugs add column if not exists status text default 'approved';
alter table public.drugs add column if not exists source_url text;
alter table public.drugs add column if not exists source_name text;
alter table public.drugs add column if not exists agency text;
alter table public.drugs add column if not exists summary text;
alter table public.drugs add column if not exists image_url text;
alter table public.drugs add column if not exists ai_metadata jsonb;
alter table public.drugs add column if not exists published_date date;

-- Drug news (novinky — nové / schválené / připravované)
create table if not exists public.drug_news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  drug_name text,
  status text not null default 'new'
    check (status in ('new', 'approved', 'pipeline')),
  agency text,
  source_url text,
  source_name text,
  summary text,
  body text,
  image_url text,
  ai_metadata jsonb,
  published boolean not null default false,
  published_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists drug_news_list_idx
  on public.drug_news (published, status, published_date desc nulls last);

alter table public.drug_news enable row level security;
drop policy if exists drug_news_public_read on public.drug_news;
create policy drug_news_public_read on public.drug_news
  for select using (published = true);
drop policy if exists drug_news_admin on public.drug_news;
create policy drug_news_admin on public.drug_news
  for all using (public.is_admin()) with check (public.is_admin());

-- Legislativa (MZČR, SÚKL, ÚZIS, EU + DRG/kódy/úhrady)
create table if not exists public.legislation_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null
    check (category in ('zakony', 'vyhlasky', 'metodiky', 'drg', 'kody', 'uhrady', 'novinky')),
  source text not null,
  summary text,
  body text,
  source_url text,
  published_date date,
  image_url text,
  ai_metadata jsonb,
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists legislation_items_cat_idx
  on public.legislation_items (published, category, published_date desc nulls last);

alter table public.legislation_items enable row level security;
drop policy if exists legislation_public_read on public.legislation_items;
create policy legislation_public_read on public.legislation_items
  for select using (published = true);
drop policy if exists legislation_admin on public.legislation_items;
create policy legislation_admin on public.legislation_items
  for all using (public.is_admin()) with check (public.is_admin());

-- Digital health (eHealth + AI health merged)
create table if not exists public.digital_health_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  topic text,
  summary text,
  body text,
  source_url text,
  source_name text,
  legislation_ref text,
  image_url text,
  ai_metadata jsonb,
  published boolean not null default false,
  published_date date,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists digital_health_list_idx
  on public.digital_health_items (published, published_date desc nulls last);

alter table public.digital_health_items enable row level security;
drop policy if exists digital_health_public_read on public.digital_health_items;
create policy digital_health_public_read on public.digital_health_items
  for select using (published = true);
drop policy if exists digital_health_admin on public.digital_health_items;
create policy digital_health_admin on public.digital_health_items
  for all using (public.is_admin()) with check (public.is_admin());

-- University / research news
create table if not exists public.university_news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  tag text not null default 'univerzity'
    check (tag in ('revmatologie', 'univerzity', 'vyzkum', 'kalendar')),
  region text default 'cz',
  university text,
  summary text,
  body text,
  source_url text,
  source_name text,
  event_date date,
  image_url text,
  ai_metadata jsonb,
  published boolean not null default false,
  published_date date,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists university_news_tag_idx
  on public.university_news (published, tag, published_date desc nulls last);

alter table public.university_news enable row level security;
drop policy if exists university_news_public_read on public.university_news;
create policy university_news_public_read on public.university_news
  for select using (published = true);
drop policy if exists university_news_admin on public.university_news;
create policy university_news_admin on public.university_news
  for all using (public.is_admin()) with check (public.is_admin());

-- Newsletter issues
create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  issue_date date not null,
  html_content text,
  pdf_text text,
  pdf_url text,
  layout_json jsonb,
  published boolean not null default false,
  admin_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists newsletters_issue_idx
  on public.newsletters (published, issue_date desc);

alter table public.newsletters enable row level security;
drop policy if exists newsletters_public_read on public.newsletters;
create policy newsletters_public_read on public.newsletters
  for select using (published = true and admin_only = false);
drop policy if exists newsletters_admin on public.newsletters;
create policy newsletters_admin on public.newsletters
  for all using (public.is_admin()) with check (public.is_admin());

-- Internal documentation versions
create table if not exists public.documentation (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  content text not null,
  admin_only boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.documentation enable row level security;
drop policy if exists documentation_public_read on public.documentation;
create policy documentation_public_read on public.documentation
  for select using (admin_only = false);
drop policy if exists documentation_admin on public.documentation;
create policy documentation_admin on public.documentation
  for all using (public.is_admin()) with check (public.is_admin());

-- Homepage curated slots (AI/manual)
create table if not exists public.homepage_curated (
  id uuid primary key default gen_random_uuid(),
  slot text not null,
  entity_type text not null,
  entity_id uuid,
  title text not null,
  href text not null,
  image_url text,
  excerpt text,
  sort_order integer not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists homepage_curated_slot_idx
  on public.homepage_curated (slot, active, sort_order);

alter table public.homepage_curated enable row level security;
drop policy if exists homepage_curated_public_read on public.homepage_curated;
create policy homepage_curated_public_read on public.homepage_curated
  for select using (active = true);
drop policy if exists homepage_curated_admin on public.homepage_curated;
create policy homepage_curated_admin on public.homepage_curated
  for all using (public.is_admin()) with check (public.is_admin());

-- V4c ingestion run log
create table if not exists public.v4c_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  status text not null default 'ok',
  items_added integer not null default 0,
  details jsonb,
  ran_at timestamptz not null default now()
);

alter table public.v4c_ingestion_runs enable row level security;
drop policy if exists v4c_ingestion_admin on public.v4c_ingestion_runs;
create policy v4c_ingestion_admin on public.v4c_ingestion_runs
  for select using (public.is_admin());

-- Seed documentation (idempotent)
insert into public.documentation (version, content, admin_only)
values
  ('v4a', 'V4a: Security layer (rate limit, Turnstile, AI abuse), legal pages (/vop, /gdpr, /cookies), SEO (json-ld, hreflang), UX (theme, breadcrumbs, CTAs), Stripe webhook, admin security logs.', false),
  ('v4b', 'V4b: B2B (/organizace), inzerce + ads_requests workflow, kariéra, kongresy, studijní spolupráce, AI reklamy (/ai/reklamy), reklamní placementy na webu.', false),
  ('v4c', 'V4c: Moduly /studie, /leky/novinky, /legislativa, /digital-health, /novinky, /newsletter, AI asistenti, homepage automatizace, denní ingest cron.', false)
on conflict (version) do nothing;
