-- Locale-aware ViaLongeVita brief: unsubscribe + last send stamp.
alter table public.newsletter_subscribers
  add column if not exists unsubscribed_at timestamptz;

alter table public.newsletter_subscribers
  add column if not exists last_brief_sent_at timestamptz;

create index if not exists newsletter_subscribers_locale_idx
  on public.newsletter_subscribers (locale);
