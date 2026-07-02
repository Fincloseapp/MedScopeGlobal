-- Repair: ensure ads.placement exists (idempotent; safe if 20260604120000 already applied)
alter table public.ads add column if not exists placement text;
alter table public.ads add column if not exists active boolean not null default true;

create index if not exists ads_placement_active_idx
  on public.ads (placement, active)
  where active = true;
