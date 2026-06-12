-- v25 public health (verejnost) — audience tagging + ad campaigns

alter table public.articles
  add column if not exists audience text not null default 'professional'
    check (audience in ('professional', 'public')),
  add column if not exists public_topic text
    check (
      public_topic is null
      or public_topic in ('zivotni-styl', 'nemoci', 'prevence', 'rozhovory')
    );

create index if not exists articles_audience_public_idx
  on public.articles (audience, published, published_at desc)
  where audience = 'public';

create index if not exists articles_public_topic_idx
  on public.articles (public_topic, published_at desc)
  where audience = 'public';

create table if not exists public_ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body_html text not null default '',
  type text not null default 'inline'
    check (type in ('inline', 'banner', 'sidebar', 'footer')),
  target_topics text[] not null default '{}',
  affiliate_url text,
  cta_text text,
  frequency int not null default 1 check (frequency between 1 and 10),
  active boolean not null default true,
  impressions int not null default 0,
  clicks int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists public_ad_campaigns_active_idx
  on public.public_ad_campaigns (active, updated_at desc);

alter table public.public_ad_campaigns enable row level security;

drop policy if exists public_ad_campaigns_public_read on public.public_ad_campaigns;
create policy public_ad_campaigns_public_read on public.public_ad_campaigns
  for select to anon, authenticated
  using (active = true);

drop policy if exists public_ad_campaigns_admin on public.public_ad_campaigns;
create policy public_ad_campaigns_admin on public.public_ad_campaigns
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
