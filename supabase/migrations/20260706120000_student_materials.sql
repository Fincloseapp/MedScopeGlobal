-- LF1.CZ curated student materials index (metadata + external links only).
-- Legal: MedScopeGlobal acts as curator/index; files remain on lf1.cz.

create table if not exists public.student_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  rocnik smallint,
  category text not null default 'rocnik'
    check (category in ('recent', 'rocnik', 'general')),
  external_url text not null,
  file_type text,
  file_size_bytes bigint,
  description text,
  source_name text not null default 'LF1.CZ',
  source_url text not null default 'https://lf1.cz/materialy-ke-stazeni/',
  source_attribution text not null default 'Zdroj: LF UK Praha — studentský portál LF1.CZ (lf1.cz). MedScopeGlobal pouze kurátoruje a odkazuje na originál.',
  hosting_mode text not null default 'external_link'
    check (hosting_mode in ('external_link', 'hosted')),
  storage_path text,
  is_active boolean not null default true,
  scraped_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (external_url, rocnik)
);

create index if not exists student_materials_rocnik_idx
  on public.student_materials (rocnik, subject);

create index if not exists student_materials_subject_idx
  on public.student_materials (subject);

create index if not exists student_materials_active_idx
  on public.student_materials (is_active, rocnik);

alter table public.student_materials enable row level security;

create policy "student_materials_public_read"
  on public.student_materials
  for select
  using (is_active = true);

create policy "student_materials_service_write"
  on public.student_materials
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

comment on table public.student_materials is
  'Curated index of LF1.CZ study materials. External links only — no republication of files.';
