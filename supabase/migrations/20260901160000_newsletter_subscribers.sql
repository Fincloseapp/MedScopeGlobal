-- Public longevity brief signups (variant F). Service role writes; no public read.
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text not null default 'cs',
  segment text not null default 'public',
  source text,
  created_at timestamptz not null default now(),
  constraint newsletter_subscribers_segment_chk
    check (segment in ('public', 'doctors')),
  constraint newsletter_subscribers_email_segment_key unique (email, segment)
);

create index if not exists newsletter_subscribers_created_idx
  on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists newsletter_subscribers_admin_read on public.newsletter_subscribers;
create policy newsletter_subscribers_admin_read on public.newsletter_subscribers
  for select to authenticated
  using (public.is_admin());
