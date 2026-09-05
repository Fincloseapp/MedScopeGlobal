-- OrdiZapis / dokumentace_notes — GDPR isolation
-- Physician with auth.uid() may only see/write rows they created.
-- service_role still bypasses RLS; app CRUD must use the user JWT client.

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
