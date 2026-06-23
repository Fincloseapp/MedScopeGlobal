-- MedScope Content Engine v19 — async jobs + metrics

create table if not exists public.v19_content_jobs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists v19_content_jobs_status_idx
  on public.v19_content_jobs (status, created_at desc);

alter table public.v19_content_jobs enable row level security;
-- No public policies — service role only (API routes).

comment on table public.v19_content_jobs is 'Async queue for v19 medical article generation';
