-- V17 audit logs (additive, service-role writes)

create table if not exists public.v17_audit_logs (
  id uuid primary key default gen_random_uuid(),
  request_id text not null,
  job_slug text not null default 'acp',
  nodes_used jsonb not null default '[]'::jsonb,
  edges_used jsonb not null default '[]'::jsonb,
  edge_scores jsonb not null default '[]'::jsonb,
  inference_chain jsonb not null default '[]'::jsonb,
  constants jsonb not null default '{}'::jsonb,
  version text,
  created_at timestamptz not null default now()
);

create index if not exists v17_audit_logs_created_idx
  on public.v17_audit_logs (created_at desc);

create index if not exists v17_audit_logs_request_idx
  on public.v17_audit_logs (request_id);

create index if not exists v17_audit_logs_job_idx
  on public.v17_audit_logs (job_slug, created_at desc);

alter table public.v17_audit_logs enable row level security;

drop policy if exists "v17_audit_logs admin read" on public.v17_audit_logs;
create policy "v17_audit_logs admin read"
  on public.v17_audit_logs for select
  using (public.is_admin());
