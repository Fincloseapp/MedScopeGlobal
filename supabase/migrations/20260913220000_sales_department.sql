-- Autonomous B2B sales department (monthly retainers, outreach, invoices, inquiries)
-- Idempotent. Applied via SQL Editor, pnpm db:migrate, or applySalesDepartmentSchema().

create table if not exists public.sales_prospects (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  slug text not null,
  website text,
  email text,
  contact_name text,
  phone text,
  ico text,
  dic text,
  address text,
  sector text not null default 'clinic',
  country text not null default 'CZ',
  stage text not null default 'identified',
  legal_basis text not null default 'none',
  score integer not null default 40,
  notes text,
  source text not null default 'icp',
  outreach_count integer not null default 0,
  last_contacted_at timestamptz,
  next_touch_at timestamptz,
  approved_outreach_at timestamptz,
  suppressed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists sales_prospects_slug_uidx on public.sales_prospects (slug);
create unique index if not exists sales_prospects_email_uidx on public.sales_prospects (lower(email)) where email is not null;
create index if not exists sales_prospects_stage_idx on public.sales_prospects (stage, updated_at desc);

create table if not exists public.sales_contracts (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.sales_prospects(id) on delete cascade,
  package_id text not null,
  status text not null default 'draft',
  monthly_czk integer not null,
  currency text not null default 'CZK',
  period_start date,
  period_end date,
  offer_text text,
  creative_url text,
  target_url text,
  landing_slug text not null,
  portal_token text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_checkout_url text,
  ads_ids jsonb not null default '[]'::jsonb,
  paid_months integer not null default 0,
  paid_total_czk integer not null default 0,
  last_paid_at timestamptz,
  grace_until timestamptz,
  cancel_at timestamptz,
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists sales_contracts_portal_uidx on public.sales_contracts (portal_token);
create index if not exists sales_contracts_status_idx on public.sales_contracts (status, updated_at desc);
create index if not exists sales_contracts_slug_idx on public.sales_contracts (landing_slug);

create table if not exists public.sales_outreach (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.sales_prospects(id) on delete cascade,
  contract_id uuid references public.sales_contracts(id) on delete set null,
  status text not null default 'queued',
  template text not null default 'offer',
  subject text not null,
  body_html text not null,
  legal_basis text not null default 'none',
  skip_reason text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists sales_outreach_status_idx on public.sales_outreach (status, created_at desc);

create table if not exists public.sales_invoices (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.sales_contracts(id) on delete cascade,
  prospect_id uuid not null references public.sales_prospects(id) on delete cascade,
  number text not null,
  variable_symbol text not null,
  status text not null default 'issued',
  amount_czk integer not null,
  period_start date not null,
  period_end date not null,
  issued_at timestamptz not null default now(),
  due_at timestamptz not null,
  paid_at timestamptz,
  sent_at timestamptz,
  payment_method text,
  stripe_invoice_id text,
  created_at timestamptz not null default now()
);

create unique index if not exists sales_invoices_number_uidx on public.sales_invoices (number);
create index if not exists sales_invoices_status_idx on public.sales_invoices (status, due_at);

create table if not exists public.sales_inquiries (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid references public.sales_contracts(id) on delete set null,
  prospect_id uuid references public.sales_prospects(id) on delete set null,
  landing_slug text not null,
  company_name text not null,
  sender_name text not null,
  sender_email text not null,
  message text not null,
  status text not null default 'received',
  forwarded_at timestamptz,
  sla_due_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists sales_inquiries_slug_idx on public.sales_inquiries (landing_slug, created_at desc);

create table if not exists public.sales_suppressions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.sales_events (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid,
  contract_id uuid,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sales_events_kind_idx on public.sales_events (kind, created_at desc);

create table if not exists public.sales_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  ok boolean not null default false,
  summary jsonb not null default '{}'::jsonb,
  error text
);

alter table public.sales_prospects enable row level security;
alter table public.sales_contracts enable row level security;
alter table public.sales_outreach enable row level security;
alter table public.sales_invoices enable row level security;
alter table public.sales_inquiries enable row level security;
alter table public.sales_suppressions enable row level security;
alter table public.sales_events enable row level security;
alter table public.sales_runs enable row level security;
