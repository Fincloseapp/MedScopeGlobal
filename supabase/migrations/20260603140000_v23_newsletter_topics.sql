-- v23.1: ruční témata newsletteru pro admin + AI zapracování
create table if not exists public.newsletter_topics (
  id uuid primary key default gen_random_uuid(),
  topic_text text not null,
  status text not null default 'pending' check (status in ('pending', 'incorporated')),
  created_at timestamptz not null default now()
);

create index if not exists newsletter_topics_pending_idx
  on public.newsletter_topics (status, created_at desc)
  where status = 'pending';

alter table public.newsletter_topics enable row level security;
drop policy if exists newsletter_topics_admin on public.newsletter_topics;
create policy newsletter_topics_admin on public.newsletter_topics
  for all using (public.is_admin()) with check (public.is_admin());
