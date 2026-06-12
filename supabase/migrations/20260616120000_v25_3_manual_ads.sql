-- v25.3 Ad Engine — manual placements + marketer activity log

create table if not exists public.manual_ad_placements (
  id uuid primary key default gen_random_uuid(),
  audience text not null
    check (audience in ('public', 'student', 'pro')),
  placement_zone text not null
    check (placement_zone in ('header', 'sidebar', 'inline', 'footer', 'article', 'custom_path')),
  target_path text not null default '/*',
  campaign_id uuid,
  html text not null default '',
  active boolean not null default true,
  priority int not null default 50 check (priority between 1 and 100),
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists manual_ad_placements_active_idx
  on public.manual_ad_placements (active, audience, priority desc);

create index if not exists manual_ad_placements_path_idx
  on public.manual_ad_placements (target_path, placement_zone)
  where active = true;

alter table public.manual_ad_placements enable row level security;

drop policy if exists manual_ad_placements_public_read on public.manual_ad_placements;
create policy manual_ad_placements_public_read on public.manual_ad_placements
  for select to anon, authenticated
  using (active = true);

drop policy if exists manual_ad_placements_admin on public.manual_ad_placements;
create policy manual_ad_placements_admin on public.manual_ad_placements
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Marketer activity audit trail
create table if not exists public.marketer_activity_log (
  id uuid primary key default gen_random_uuid(),
  marketer_id text not null
    check (marketer_id in ('public', 'students', 'pro')),
  action text not null,
  details jsonb not null default '{}',
  proposal_id uuid references public.marketing_proposals (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists marketer_activity_log_marketer_idx
  on public.marketer_activity_log (marketer_id, created_at desc);

create index if not exists marketer_activity_log_action_idx
  on public.marketer_activity_log (action, created_at desc);

alter table public.marketer_activity_log enable row level security;

drop policy if exists marketer_activity_log_admin on public.marketer_activity_log;
create policy marketer_activity_log_admin on public.marketer_activity_log
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
