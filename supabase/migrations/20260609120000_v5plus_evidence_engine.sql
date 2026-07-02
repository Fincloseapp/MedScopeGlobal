-- V5+ Evidence-Based AI Engine (additive)

create table if not exists public.medical_sources (
  id uuid primary key default gen_random_uuid(),
  url text,
  doi text,
  pubmed_id text,
  source_type text not null check (
    source_type in ('pubmed', 'pmc', 'sukl', 'ema', 'fda', 'university')
  ),
  title text not null,
  authors text,
  journal text,
  year int,
  abstract text,
  metadata jsonb not null default '{}'::jsonb,
  validated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists medical_sources_doi_uidx
  on public.medical_sources (lower(doi)) where doi is not null and doi <> '';

create unique index if not exists medical_sources_pubmed_uidx
  on public.medical_sources (pubmed_id) where pubmed_id is not null and pubmed_id <> '';

create index if not exists medical_sources_type_idx on public.medical_sources (source_type, created_at desc);

create table if not exists public.medical_citations (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.medical_ai_texts(id) on delete cascade,
  citation_format text not null check (citation_format in ('vancouver', 'apa', 'harvard')),
  citation_text text not null,
  doi text,
  url text,
  created_at timestamptz not null default now()
);

create unique index if not exists medical_citations_article_format_uidx
  on public.medical_citations (article_id, citation_format);

create index if not exists medical_citations_article_idx
  on public.medical_citations (article_id);

create table if not exists public.medical_evidence (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.medical_ai_texts(id) on delete cascade,
  evidence_level text not null check (evidence_level in ('A', 'B', 'C', 'D')),
  study_type text,
  sample_size int,
  clinical_relevance text,
  recommendation_strength text,
  data_quality text,
  clinical_conclusions text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists medical_evidence_article_uidx
  on public.medical_evidence (article_id);

alter table public.medical_sources enable row level security;
alter table public.medical_citations enable row level security;
alter table public.medical_evidence enable row level security;

drop policy if exists medical_sources_public_read on public.medical_sources;
create policy medical_sources_public_read on public.medical_sources
  for select using (true);

drop policy if exists medical_sources_admin_all on public.medical_sources;
create policy medical_sources_admin_all on public.medical_sources
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists medical_citations_public_read on public.medical_citations;
create policy medical_citations_public_read on public.medical_citations
  for select using (true);

drop policy if exists medical_citations_admin_all on public.medical_citations;
create policy medical_citations_admin_all on public.medical_citations
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists medical_evidence_public_read on public.medical_evidence;
create policy medical_evidence_public_read on public.medical_evidence
  for select using (true);

drop policy if exists medical_evidence_admin_all on public.medical_evidence;
create policy medical_evidence_admin_all on public.medical_evidence
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.documentation (version, content, admin_only)
values (
  'v5plus',
  'V5+ Evidence Engine: medical_sources, medical_citations, medical_evidence, DOI, PubMed/PMC, SÚKL/EMA/FDA, evidence scoring A-D, /odborne/citace|zdroje|doi|pubmed|evidence, crons daily_pubmed_update + daily_regulatory_update.',
  false
)
on conflict (version) do nothing;
