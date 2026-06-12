-- v25.4 — ČLK ověření lékařů pro odbornou sekci

create table if not exists public.clk_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  email text,
  full_name text,
  clk_number text not null,
  status text not null default 'manual_review'
    check (status in ('pending', 'manual_review', 'verified', 'rejected')),
  method text not null default 'manual'
    check (method in ('api', 'manual')),
  api_result jsonb,
  audit_log jsonb not null default '[]'::jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clk_verifications_user_idx
  on public.clk_verifications (user_id, updated_at desc);

create index if not exists clk_verifications_status_idx
  on public.clk_verifications (status, updated_at desc);

alter table public.clk_verifications enable row level security;

drop policy if exists clk_verifications_select_own on public.clk_verifications;
create policy clk_verifications_select_own on public.clk_verifications
  for select using (auth.uid() = user_id);

drop policy if exists clk_verifications_select_admin on public.clk_verifications;
create policy clk_verifications_select_admin on public.clk_verifications
  for select using (public.is_admin());
