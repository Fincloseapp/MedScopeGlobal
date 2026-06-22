-- v25.1 — persistent universities report for Vercel

create table if not exists public.v25_universities_snapshot (
  id text primary key default 'production',
  report jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
