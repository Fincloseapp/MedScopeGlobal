-- MedScope Prep: question bank + attempts (developer schema)
-- Questions can be served from TypeScript seed (lib/prep) or loaded into these tables.

create table if not exists prep_questions (
  id text primary key,
  subject text not null check (subject in ('biologie', 'chemie', 'fyzika', 'matematika')),
  chapter_id text not null,
  topic text not null,
  difficulty text not null check (difficulty in ('zaklad', 'stredni', 'narocne')),
  prompt text not null,
  options jsonb not null,
  correct_index integer not null,
  correct_indices integer[] null,
  explanation text not null,
  faculties text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists prep_questions_subject_idx on prep_questions (subject);
create index if not exists prep_questions_chapter_idx on prep_questions (chapter_id);
create index if not exists prep_questions_topic_idx on prep_questions (topic);

create table if not exists prep_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users (id) on delete set null,
  faculty_slug text null,
  mode text not null,
  title text not null,
  subjects text[] not null,
  correct integer not null,
  total integer not null,
  score_pct integer not null,
  duration_sec integer not null default 0,
  timed_out boolean not null default false,
  weak_topics text[] not null default '{}',
  answers jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists prep_attempts_user_idx on prep_attempts (user_id, created_at desc);
create index if not exists prep_attempts_faculty_idx on prep_attempts (faculty_slug);

create table if not exists prep_topic_stats (
  user_id uuid not null references auth.users (id) on delete cascade,
  topic text not null,
  subject text not null,
  seen integer not null default 0,
  correct integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, topic)
);

create table if not exists prep_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  faculty_slug text null,
  completed_chapters text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table prep_questions enable row level security;
alter table prep_attempts enable row level security;
alter table prep_topic_stats enable row level security;
alter table prep_profiles enable row level security;

-- Question keys stay in the app seed (lib/prep). Do not expose answers to anon.
revoke all on table prep_questions from anon, authenticated;
grant select, insert, update, delete on table prep_questions to service_role;

drop policy if exists prep_attempts_own on prep_attempts;
create policy prep_attempts_own on prep_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists prep_topic_stats_own on prep_topic_stats;
create policy prep_topic_stats_own on prep_topic_stats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists prep_profiles_own on prep_profiles;
create policy prep_profiles_own on prep_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
