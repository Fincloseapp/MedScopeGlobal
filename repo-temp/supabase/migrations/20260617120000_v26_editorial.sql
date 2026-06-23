-- v26 editorial standard — metadata for persona, editorial version, source citations
alter table public.articles
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists articles_metadata_editorial_version_idx
  on public.articles ((metadata->>'editorial_version'))
  where metadata ? 'editorial_version';

create index if not exists articles_metadata_section_idx
  on public.articles ((metadata->>'section'))
  where metadata ? 'section';
