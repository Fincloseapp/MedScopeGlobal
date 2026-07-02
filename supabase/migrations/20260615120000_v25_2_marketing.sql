-- v25.2 Ad Engine — student/pro campaigns + AI marketing pipeline

-- Optional student metadata on articles for ad targeting
alter table public.articles
  add column if not exists study_year int check (study_year is null or study_year between 1 and 6),
  add column if not exists med_track text,
  add column if not exists student_topic text;

create index if not exists articles_student_target_idx
  on public.articles (study_year, med_track, student_topic)
  where audience = 'professional';

-- Student ad campaigns
create table if not exists public.student_ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body_html text not null default '',
  type text not null default 'inline'
    check (type in ('inline', 'banner', 'sidebar', 'footer')),
  study_years int[] not null default '{}',
  med_tracks text[] not null default '{}',
  target_topics text[] not null default '{}',
  affiliate_url text,
  cta_text text,
  frequency int not null default 1 check (frequency between 1 and 10),
  active boolean not null default true,
  impressions int not null default 0,
  clicks int not null default 0,
  proposal_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_ad_campaigns_active_idx
  on public.student_ad_campaigns (active, updated_at desc);

alter table public.student_ad_campaigns enable row level security;

drop policy if exists student_ad_campaigns_public_read on public.student_ad_campaigns;
create policy student_ad_campaigns_public_read on public.student_ad_campaigns
  for select to anon, authenticated
  using (active = true);

drop policy if exists student_ad_campaigns_admin on public.student_ad_campaigns;
create policy student_ad_campaigns_admin on public.student_ad_campaigns
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Pro / B2B ad campaigns
create table if not exists public.pro_ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body_html text not null default '',
  type text not null default 'inline'
    check (type in ('inline', 'banner', 'sidebar', 'footer')),
  target_specialties text[] not null default '{}',
  b2b_category text
    check (b2b_category is null or b2b_category in ('conferences', 'journals', 'equipment', 'software', 'services')),
  affiliate_url text,
  cta_text text,
  frequency int not null default 1 check (frequency between 1 and 10),
  active boolean not null default true,
  impressions int not null default 0,
  clicks int not null default 0,
  proposal_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pro_ad_campaigns_active_idx
  on public.pro_ad_campaigns (active, updated_at desc);

alter table public.pro_ad_campaigns enable row level security;

drop policy if exists pro_ad_campaigns_public_read on public.pro_ad_campaigns;
create policy pro_ad_campaigns_public_read on public.pro_ad_campaigns
  for select to anon, authenticated
  using (active = true);

drop policy if exists pro_ad_campaigns_admin on public.pro_ad_campaigns;
create policy pro_ad_campaigns_admin on public.pro_ad_campaigns
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- AI marketer proposals (pending coordinator review)
create table if not exists public.marketing_proposals (
  id uuid primary key default gen_random_uuid(),
  marketer_id text not null
    check (marketer_id in ('public', 'students', 'pro')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  title text not null,
  body_html text not null default '',
  campaign_type text not null default 'inline'
    check (campaign_type in ('inline', 'banner', 'sidebar', 'footer')),
  targeting jsonb not null default '{}',
  affiliate_url text,
  cta_text text,
  partner_id text,
  partner_name text,
  priority int not null default 50 check (priority between 1 and 100),
  traffic_score numeric(5,2),
  relevance_score numeric(5,2),
  commission_estimate numeric(8,2),
  coordinator_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_proposals_status_idx
  on public.marketing_proposals (status, priority desc, created_at desc);

create index if not exists marketing_proposals_marketer_idx
  on public.marketing_proposals (marketer_id, status);

alter table public.marketing_proposals enable row level security;

drop policy if exists marketing_proposals_admin on public.marketing_proposals;
create policy marketing_proposals_admin on public.marketing_proposals
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Weekly coordinator reports
create table if not exists public.marketing_reports (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  summary text not null default '',
  proposals_pending int not null default 0,
  proposals_approved int not null default 0,
  proposals_rejected int not null default 0,
  metrics jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create unique index if not exists marketing_reports_week_idx
  on public.marketing_reports (week_start);

alter table public.marketing_reports enable row level security;

drop policy if exists marketing_reports_admin on public.marketing_reports;
create policy marketing_reports_admin on public.marketing_reports
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
