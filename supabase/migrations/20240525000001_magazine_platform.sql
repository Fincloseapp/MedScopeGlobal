-- MedScopeGlobal — platform extensions (access levels, rubrics, billing, ads)

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
