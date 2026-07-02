-- v25.1 ULTRA-MAX ENTERPRISE++ — system state + cron runs

create table if not exists public.v25_system_runs (
  id uuid primary key default gen_random_uuid(),
  run_type text not null,
  status text not null check (status in ('ok', 'fail', 'partial')),
  payload jsonb not null default '{}'::jsonb,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists v25_system_runs_type_started_idx
  on public.v25_system_runs (run_type, started_at desc);

create table if not exists public.v25_fix_log (
  id uuid primary key default gen_random_uuid(),
  error_type text not null,
  module text not null,
  action text not null check (action in ('autofix', 'redeploy', 'rollback')),
  result text not null check (result in ('ok', 'fail', 'partial')),
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists v25_fix_log_created_idx on public.v25_fix_log (created_at desc);
