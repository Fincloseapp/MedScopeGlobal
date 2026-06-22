-- v30 security audit + payment anti-fraud tables

create table if not exists public.security_audit_logs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  ip text,
  user_id uuid references auth.users (id) on delete set null,
  endpoint text,
  details jsonb not null default '{}'::jsonb,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  created_at timestamptz not null default now()
);

create index if not exists security_audit_logs_created_at_idx
  on public.security_audit_logs (created_at desc);

create index if not exists security_audit_logs_type_idx
  on public.security_audit_logs (type);

create index if not exists security_audit_logs_severity_idx
  on public.security_audit_logs (severity);

alter table public.security_audit_logs enable row level security;

drop policy if exists "security_audit_logs service role" on public.security_audit_logs;
create policy "security_audit_logs service role"
  on public.security_audit_logs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- payment attempts for anti-fraud
create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  ip text,
  stripe_session_id text,
  status text not null default 'initiated',
  created_at timestamptz not null default now()
);

create index if not exists payment_attempts_ip_created_idx
  on public.payment_attempts (ip, created_at desc);

create index if not exists payment_attempts_session_idx
  on public.payment_attempts (stripe_session_id)
  where stripe_session_id is not null;

alter table public.payment_attempts enable row level security;

drop policy if exists "payment_attempts service role" on public.payment_attempts;
create policy "payment_attempts service role"
  on public.payment_attempts for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
