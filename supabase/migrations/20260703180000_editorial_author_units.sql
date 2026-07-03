-- Editorial author units — metadata indexes (values stored in articles.metadata JSONB)

create index if not exists articles_metadata_editorial_unit_primary_idx
  on public.articles ((metadata->>'editorial_unit_primary'))
  where metadata ? 'editorial_unit_primary';

create index if not exists articles_metadata_ai_assisted_idx
  on public.articles ((metadata->>'ai_assisted'))
  where metadata ? 'ai_assisted';

comment on column public.articles.metadata is
  'JSONB incl. editorial_unit_primary, editorial_unit_reviewer, ai_assisted, writing_style';
