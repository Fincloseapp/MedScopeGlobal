-- V4b: B2B, advertising requests, career, study collaboration, congresses (additive)

-- Extend existing ads table (keeps title, image_url, link_url, active, placement)
-- Remote DBs created without placement must get the column before indexes reference it
alter table public.ads add column if not exists placement text;
alter table public.ads add column if not exists active boolean not null default true;
alter table public.ads add column if not exists client_name text;
alter table public.ads add column if not exists client_email text;
alter table public.ads add column if not exists company text;
alter table public.ads add column if not exists ico text;
alter table public.ads add column if not exists dic text;
alter table public.ads add column if not exists type text;
alter table public.ads add column if not exists position_newsletter text;
alter table public.ads add column if not exists target_url text;
alter table public.ads add column if not exists ad_text text;
alter table public.ads add column if not exists price numeric(12, 2);
alter table public.ads add column if not exists start_date date;
alter table public.ads add column if not exists end_date date;
alter table public.ads add column if not exists ad_status text default 'active';
alter table public.ads add column if not exists include_in_newsletter boolean not null default false;
alter table public.ads add column if not exists request_id uuid;
alter table public.ads add column if not exists campaign_id uuid references public.ad_campaigns (id) on delete set null;

create index if not exists ads_placement_active_idx
  on public.ads (placement, active)
  where active = true;

create index if not exists ads_status_dates_idx
  on public.ads (ad_status, start_date, end_date);

-- Ad intake requests
create table if not exists public.ads_requests (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact_person text not null,
  email text not null,
  phone text,
  ico text,
  dic text,
  type text not null,
  position text,
  position_newsletter text,
  duration text,
  price numeric(12, 2),
  banner_url text,
  ad_text text,
  url text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'paid', 'active')),
  approval_token text,
  stripe_payment_link text,
  stripe_session_id text,
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists ads_requests_status_idx on public.ads_requests (status, created_at desc);
create unique index if not exists ads_requests_approval_token_idx
  on public.ads_requests (approval_token)
  where approval_token is not null;

alter table public.ads_requests enable row level security;
drop policy if exists ads_requests_admin on public.ads_requests;
create policy ads_requests_admin on public.ads_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Career
create table if not exists public.job_postings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  company text not null,
  specialization text,
  region text,
  employment_type text,
  description text not null,
  requirements text,
  salary_hint text,
  contact_email text,
  apply_url text,
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists job_postings_list_idx
  on public.job_postings (published, specialization, region, created_at desc);

alter table public.job_postings enable row level security;
drop policy if exists job_postings_public_read on public.job_postings;
create policy job_postings_public_read on public.job_postings
  for select using (published = true);
drop policy if exists job_postings_admin on public.job_postings;
create policy job_postings_admin on public.job_postings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Study collaboration
create table if not exists public.study_collaborations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  organization text not null,
  summary text not null,
  body text,
  specialty text,
  phase text,
  contact_email text,
  apply_url text,
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists study_collaborations_list_idx
  on public.study_collaborations (published, created_at desc);

alter table public.study_collaborations enable row level security;
drop policy if exists study_collaborations_public_read on public.study_collaborations;
create policy study_collaborations_public_read on public.study_collaborations
  for select using (published = true);
drop policy if exists study_collaborations_admin on public.study_collaborations;
create policy study_collaborations_admin on public.study_collaborations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Congresses & training
create table if not exists public.congress_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  body text,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  venue text,
  price_hint text,
  registration_url text,
  image_url text,
  source_url text,
  organizer text,
  specialty text,
  region text default 'CZ',
  published boolean not null default false,
  featured boolean not null default false,
  ai_extracted jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists congress_events_calendar_idx
  on public.congress_events (published, starts_at);

alter table public.congress_events enable row level security;
drop policy if exists congress_events_public_read on public.congress_events;
create policy congress_events_public_read on public.congress_events
  for select using (published = true);
drop policy if exists congress_events_admin on public.congress_events;
create policy congress_events_admin on public.congress_events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- B2B partner inquiries
create table if not exists public.b2b_inquiries (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  contact_person text not null,
  email text not null,
  phone text,
  inquiry_type text not null,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.b2b_inquiries enable row level security;
drop policy if exists b2b_inquiries_admin on public.b2b_inquiries;
create policy b2b_inquiries_admin on public.b2b_inquiries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
