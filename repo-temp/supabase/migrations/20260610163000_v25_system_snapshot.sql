-- v25.1 — persistent system state for Vercel (ephemeral /tmp)

create table if not exists public.v25_system_snapshot (
  id text primary key default 'production',
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
