create table if not exists public.dokumentace_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id text,
  mode text,
  specialty text,
  transcript text,
  note text not null,
  title text,
  source text default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dokumentace_notes_user_created_idx
  on public.dokumentace_notes (user_id, created_at desc);

alter table public.dokumentace_notes enable row level security;

drop policy if exists dokumentace_notes_select_own on public.dokumentace_notes;
create policy dokumentace_notes_select_own on public.dokumentace_notes
  for select using (auth.uid() = user_id);

drop policy if exists dokumentace_notes_insert_own on public.dokumentace_notes;
create policy dokumentace_notes_insert_own on public.dokumentace_notes
  for insert with check (auth.uid() = user_id);

drop policy if exists dokumentace_notes_update_own on public.dokumentace_notes;
create policy dokumentace_notes_update_own on public.dokumentace_notes
  for update using (auth.uid() = user_id);

drop policy if exists dokumentace_notes_delete_own on public.dokumentace_notes;
create policy dokumentace_notes_delete_own on public.dokumentace_notes
  for delete using (auth.uid() = user_id);
