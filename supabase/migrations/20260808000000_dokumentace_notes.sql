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
alter table public.dokumentace_notes force row level security;

revoke all on table public.dokumentace_notes from anon;
revoke all on table public.dokumentace_notes from public;
grant select, insert, update, delete on table public.dokumentace_notes to authenticated;

drop policy if exists dokumentace_notes_select_own on public.dokumentace_notes;
create policy dokumentace_notes_select_own
  on public.dokumentace_notes
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists dokumentace_notes_insert_own on public.dokumentace_notes;
create policy dokumentace_notes_insert_own
  on public.dokumentace_notes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists dokumentace_notes_update_own on public.dokumentace_notes;
create policy dokumentace_notes_update_own
  on public.dokumentace_notes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists dokumentace_notes_delete_own on public.dokumentace_notes;
create policy dokumentace_notes_delete_own
  on public.dokumentace_notes
  for delete
  to authenticated
  using (auth.uid() = user_id);

comment on table public.dokumentace_notes is
  'OrdiZapis clinical notes/transcripts. RLS forced: auth.uid() = user_id. Cross-physician leak is a GDPR breach.';
