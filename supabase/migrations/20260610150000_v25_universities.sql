-- v25.1 universities provider runs

create table if not exists public.v25_university_runs (
  id uuid primary key default gen_random_uuid(),
  faculty_slug text not null,
  faculty_name text not null,
  source_url text not null,
  status text not null check (status in ('ok', 'fail')),
  payload jsonb not null default '{}'::jsonb,
  new_articles int not null default 0,
  updates int not null default 0,
  fetched_at timestamptz not null default now()
);

create index if not exists v25_university_runs_slug_idx
  on public.v25_university_runs (faculty_slug, fetched_at desc);
