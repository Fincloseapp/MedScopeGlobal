-- MedScope Academy B2B CME — Lékařská zóna
-- Partner institutions, ČLK accreditation, medical verification, quiz attempts

-- ---------------------------------------------------------------------------
-- 1. Physician verification fields on public.users
-- ---------------------------------------------------------------------------
alter table public.users
  add column if not exists clk_id text,
  add column if not exists specialization text,
  add column if not exists verified_doctor boolean not null default false,
  add column if not exists first_name text,
  add column if not exists last_name text;

create unique index if not exists users_clk_id_unique
  on public.users (clk_id)
  where clk_id is not null and length(trim(clk_id)) > 0;

create index if not exists users_verified_doctor_idx
  on public.users (verified_doctor)
  where verified_doctor = true;

comment on column public.users.clk_id is 'ČLK registration number (unique when set)';
comment on column public.users.verified_doctor is 'True only after ČLK verification — required for Lékařská zóna / CME';

-- ---------------------------------------------------------------------------
-- 2. Partner institutions (B2B course providers)
-- ---------------------------------------------------------------------------
create table if not exists public.partner_institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  contact_email text not null,
  api_key_hash text,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partner_institutions_active_idx
  on public.partner_institutions (is_active, name);

-- Partner staff mapping (institution admins for reporting)
create table if not exists public.partner_institution_members (
  id uuid primary key default gen_random_uuid(),
  partner_institution_id uuid not null
    references public.partner_institutions (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null default 'reporter'
    check (role in ('owner', 'admin', 'reporter')),
  created_at timestamptz not null default now(),
  unique (partner_institution_id, user_id)
);

create index if not exists partner_institution_members_user_idx
  on public.partner_institution_members (user_id);

-- ---------------------------------------------------------------------------
-- 3. Extend courses for ČLK-accredited B2B CME
-- ---------------------------------------------------------------------------
alter table public.courses
  add column if not exists accreditation_number text,
  add column if not exists credits_count integer not null default 0,
  add column if not exists partner_institution_id uuid
    references public.partner_institutions (id) on delete set null,
  add column if not exists requires_verified_doctor boolean not null default false,
  add column if not exists passing_threshold integer not null default 80
    check (passing_threshold between 1 and 100);

create index if not exists courses_partner_idx
  on public.courses (partner_institution_id)
  where partner_institution_id is not null;

create index if not exists courses_accreditation_idx
  on public.courses (accreditation_number)
  where accreditation_number is not null;

create index if not exists courses_cme_gate_idx
  on public.courses (requires_verified_doctor, status)
  where requires_verified_doctor = true;

-- ---------------------------------------------------------------------------
-- 4. Modules (course → module → lesson)
-- ---------------------------------------------------------------------------
create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists course_modules_course_idx
  on public.course_modules (course_id, sort_order);

alter table public.lessons
  add column if not exists module_id uuid
    references public.course_modules (id) on delete set null,
  add column if not exists lock_forward boolean not null default false,
  add column if not exists article_body text;

create index if not exists lessons_module_idx
  on public.lessons (module_id)
  where module_id is not null;

-- ---------------------------------------------------------------------------
-- 5. Quiz bank + attempts (algorithmic engine)
-- ---------------------------------------------------------------------------
alter table public.quizzes
  add column if not exists question_sample_size integer,
  add column if not exists shuffle_answers boolean not null default true,
  add column if not exists max_attempts integer,
  add column if not exists unlock_requires_video boolean not null default true;

-- Question bank can exceed what is shown per attempt (sample from bank)
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  attempt_number integer not null default 1,
  question_ids uuid[] not null default '{}',
  answers jsonb not null default '{}'::jsonb,
  score integer,
  passed boolean,
  passing_threshold integer not null default 80,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (quiz_id, user_id, attempt_number)
);

create index if not exists quiz_attempts_user_quiz_idx
  on public.quiz_attempts (user_id, quiz_id, attempt_number desc);

-- Lesson watch progress (server-side unlock for quiz)
create table if not exists public.lesson_watch_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  max_watched_seconds numeric(12, 2) not null default 0,
  duration_seconds numeric(12, 2),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists lesson_watch_progress_user_idx
  on public.lesson_watch_progress (user_id, completed);

-- ---------------------------------------------------------------------------
-- 6. Certificates — ČLK / CME fields
-- ---------------------------------------------------------------------------
alter table public.certificates
  add column if not exists clk_id text,
  add column if not exists accreditation_number text,
  add column if not exists credits_earned integer not null default 0,
  add column if not exists partner_institution_id uuid
    references public.partner_institutions (id) on delete set null,
  add column if not exists pdf_storage_path text,
  add column if not exists physician_full_name text;

create index if not exists certificates_partner_completed_idx
  on public.certificates (partner_institution_id, issued_at desc)
  where partner_institution_id is not null;

create index if not exists certificates_clk_idx
  on public.certificates (clk_id)
  where clk_id is not null;

-- ---------------------------------------------------------------------------
-- 7. RLS
-- ---------------------------------------------------------------------------
alter table public.partner_institutions enable row level security;
alter table public.partner_institution_members enable row level security;
alter table public.course_modules enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.lesson_watch_progress enable row level security;

drop policy if exists partner_institutions_public_read on public.partner_institutions;
create policy partner_institutions_public_read on public.partner_institutions
  for select using (is_active = true or public.is_admin());

drop policy if exists partner_institutions_admin_all on public.partner_institutions;
create policy partner_institutions_admin_all on public.partner_institutions
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists partner_members_own on public.partner_institution_members;
create policy partner_members_own on public.partner_institution_members
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists partner_members_admin on public.partner_institution_members;
create policy partner_members_admin on public.partner_institution_members
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists course_modules_read on public.course_modules;
create policy course_modules_read on public.course_modules
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.courses c
      where c.id = course_id
        and c.status = 'published'
        and c.is_public = true
    )
  );

drop policy if exists course_modules_admin on public.course_modules;
create policy course_modules_admin on public.course_modules
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists quiz_attempts_own on public.quiz_attempts;
create policy quiz_attempts_own on public.quiz_attempts
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists quiz_attempts_insert_own on public.quiz_attempts;
create policy quiz_attempts_insert_own on public.quiz_attempts
  for insert with check (auth.uid() = user_id);

drop policy if exists quiz_attempts_update_own on public.quiz_attempts;
create policy quiz_attempts_update_own on public.quiz_attempts
  for update using (auth.uid() = user_id);

drop policy if exists lesson_watch_own on public.lesson_watch_progress;
create policy lesson_watch_own on public.lesson_watch_progress
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- 8. Helper: verified physician check (used by app + optional RLS)
-- ---------------------------------------------------------------------------
create or replace function public.is_verified_doctor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.verified_doctor = true
      and u.clk_id is not null
      and length(trim(u.clk_id)) > 0
  );
$$;

grant execute on function public.is_verified_doctor() to authenticated, anon;

-- Keep users.verified_doctor in sync when ČLK verification is approved
create or replace function public.sync_verified_doctor_from_clk()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'verified' then
    update public.users
    set
      verified_doctor = true,
      clk_id = coalesce(nullif(trim(new.clk_number), ''), clk_id),
      full_name = coalesce(nullif(trim(new.full_name), ''), full_name)
    where id = new.user_id;
  elsif new.status = 'rejected' then
    update public.users
    set verified_doctor = false
    where id = new.user_id
      and clk_id is not distinct from new.clk_number;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_verified_doctor on public.clk_verifications;
create trigger trg_sync_verified_doctor
  after insert or update of status on public.clk_verifications
  for each row execute function public.sync_verified_doctor_from_clk();
