-- MeDiktor physician onboarding: OTP challenges, doctor verification, SW integrations

-- ---------------------------------------------------------------------------
-- OTP challenges (email primary; SMS optional when provider configured)
-- ---------------------------------------------------------------------------
create table if not exists public.mediktor_otp_challenges (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('email', 'sms')),
  destination text not null,
  destination_norm text not null,
  code_hash text not null,
  attempts int not null default 0,
  max_attempts int not null default 5,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  ip text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists mediktor_otp_challenges_dest_idx
  on public.mediktor_otp_challenges (destination_norm, created_at desc);

create index if not exists mediktor_otp_challenges_expires_idx
  on public.mediktor_otp_challenges (expires_at);

alter table public.mediktor_otp_challenges enable row level security;
-- No end-user policies: service role only

-- ---------------------------------------------------------------------------
-- Doctor verification (background KYC; app usable while pending)
-- ---------------------------------------------------------------------------
create table if not exists public.mediktor_doctor_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected')),
  methods jsonb not null default '[]'::jsonb,
  license_number text,
  facility_ico text,
  work_email text,
  id_photo_path text,
  id_ocr_summary jsonb,
  reviewer_note text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists mediktor_doctor_verifications_status_idx
  on public.mediktor_doctor_verifications (status, updated_at desc);

alter table public.mediktor_doctor_verifications enable row level security;

drop policy if exists mediktor_doctor_verifications_select_own
  on public.mediktor_doctor_verifications;
create policy mediktor_doctor_verifications_select_own
  on public.mediktor_doctor_verifications
  for select using (auth.uid() = user_id);

drop policy if exists mediktor_doctor_verifications_insert_own
  on public.mediktor_doctor_verifications;
create policy mediktor_doctor_verifications_insert_own
  on public.mediktor_doctor_verifications
  for insert with check (auth.uid() = user_id);

drop policy if exists mediktor_doctor_verifications_update_own
  on public.mediktor_doctor_verifications;
create policy mediktor_doctor_verifications_update_own
  on public.mediktor_doctor_verifications
  for update using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Ambulatory / hospital SW integration settings + delivery log
-- ---------------------------------------------------------------------------
create table if not exists public.mediktor_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  active boolean not null default false,
  integration_type text not null default 'export'
    check (integration_type in ('export', 'webhook', 'hl7', 'fhir', 'api')),
  preset_target text,
  formats text[] not null default array['text', 'pdf']::text[],
  webhook_url text,
  api_key_hint text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists mediktor_integrations_active_idx
  on public.mediktor_integrations (user_id)
  where active = true;

alter table public.mediktor_integrations enable row level security;

drop policy if exists mediktor_integrations_select_own on public.mediktor_integrations;
create policy mediktor_integrations_select_own on public.mediktor_integrations
  for select using (auth.uid() = user_id);

drop policy if exists mediktor_integrations_upsert_own on public.mediktor_integrations;
create policy mediktor_integrations_upsert_own on public.mediktor_integrations
  for insert with check (auth.uid() = user_id);

drop policy if exists mediktor_integrations_update_own on public.mediktor_integrations;
create policy mediktor_integrations_update_own on public.mediktor_integrations
  for update using (auth.uid() = user_id);

create table if not exists public.mediktor_integration_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid,
  integration_id uuid references public.mediktor_integrations(id) on delete set null,
  channel text not null,
  status text not null default 'stubbed'
    check (status in ('queued', 'sent', 'failed', 'stubbed')),
  payload_preview text,
  response_summary jsonb,
  created_at timestamptz not null default now()
);

create index if not exists mediktor_integration_deliveries_user_idx
  on public.mediktor_integration_deliveries (user_id, created_at desc);

alter table public.mediktor_integration_deliveries enable row level security;

drop policy if exists mediktor_integration_deliveries_select_own
  on public.mediktor_integration_deliveries;
create policy mediktor_integration_deliveries_select_own
  on public.mediktor_integration_deliveries
  for select using (auth.uid() = user_id);

-- Optional profile helpers (safe if columns already exist)
alter table public.users
  add column if not exists phone text,
  add column if not exists mediktor_onboarding_completed boolean default false,
  add column if not exists mediktor_verification_status text;

comment on table public.mediktor_otp_challenges is
  'MeDiktor passwordless OTP challenges; service-role only';
comment on table public.mediktor_doctor_verifications is
  'Background physician KYC for MeDiktor; pending allows immediate app use';
comment on table public.mediktor_integrations is
  'Ambulatory/hospital SW connector settings for MeDiktor dictation export';
