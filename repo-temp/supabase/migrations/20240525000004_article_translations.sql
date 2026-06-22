create table if not exists public.article_translations (
  article_id uuid not null references public.articles (id) on delete cascade,
  locale text not null,
  title text not null,
  excerpt text,
  content text,
  updated_at timestamptz not null default now(),
  primary key (article_id, locale)
);

create index if not exists article_translations_locale_idx
  on public.article_translations (locale);

alter table public.article_translations enable row level security;

drop policy if exists article_translations_select on public.article_translations;
create policy article_translations_select on public.article_translations
  for select using (true);
