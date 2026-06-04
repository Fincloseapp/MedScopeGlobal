-- V4d: Odborné AI texty — study_sources, medical_ai_*, university seeds (additive)

-- ---------------------------------------------------------------------------
-- study_sources (universities + databases)
-- ---------------------------------------------------------------------------
create table if not exists public.study_sources (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  url text,
  region text not null check (region in ('cz', 'sk', 'eu', 'world')),
  institution_type text not null default 'university',
  specialties text[] not null default '{}',
  languages text[] not null default array['cs', 'en'],
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- medical_ai_texts — odborné texty pro modul /odborne
-- ---------------------------------------------------------------------------
create table if not exists public.medical_ai_texts (
  id uuid primary key default gen_random_uuid(),
  study_source_id uuid references public.study_sources(id) on delete set null,
  title text not null,
  slug text unique not null,
  original_language text check (original_language in ('cs', 'sk', 'en', 'de', 'fr')),
  content_cs text,
  summary_clinician text,
  summary_patient text,
  doi text,
  pubmed_id text,
  source_url text,
  source_name text,
  specialty text,
  categories jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  ai_metadata jsonb not null default '{}'::jsonb,
  quality_passed boolean not null default false,
  published boolean not null default true,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists medical_ai_texts_published_idx
  on public.medical_ai_texts (published, archived, created_at desc);

create unique index if not exists medical_ai_texts_doi_uidx
  on public.medical_ai_texts (lower(doi)) where doi is not null and doi <> '';

create unique index if not exists medical_ai_texts_source_url_uidx
  on public.medical_ai_texts (source_url) where source_url is not null and source_url <> '';

-- ---------------------------------------------------------------------------
-- medical_ai_categories — taxonomie (diagnóza, typ studie, …)
-- ---------------------------------------------------------------------------
create table if not exists public.medical_ai_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label_cs text not null,
  category_type text not null check (
    category_type in (
      'diagnosis',
      'study_type',
      'evidence_level',
      'clinical_impact',
      'practice',
      'specialty',
      'language'
    )
  ),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- medical_ai_quality — kontrola kvality per text
-- ---------------------------------------------------------------------------
create table if not exists public.medical_ai_quality (
  id uuid primary key default gen_random_uuid(),
  text_id uuid not null references public.medical_ai_texts(id) on delete cascade,
  duplicate_score numeric(5, 2),
  text_quality_score numeric(5, 2),
  relevance_score numeric(5, 2),
  language_match boolean,
  expertise_level text,
  passed boolean not null default false,
  checks jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now()
);

create index if not exists medical_ai_quality_text_id_idx
  on public.medical_ai_quality (text_id, checked_at desc);

-- ---------------------------------------------------------------------------
-- medical_ai_logs — běhy ingestu a události
-- ---------------------------------------------------------------------------
create table if not exists public.medical_ai_logs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid,
  log_type text not null check (log_type in ('ingest_run', 'article', 'quality', 'error')),
  study_source_id uuid references public.study_sources(id) on delete set null,
  text_id uuid references public.medical_ai_texts(id) on delete set null,
  message text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists medical_ai_logs_run_id_idx on public.medical_ai_logs (run_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.study_sources enable row level security;
alter table public.medical_ai_texts enable row level security;
alter table public.medical_ai_categories enable row level security;
alter table public.medical_ai_quality enable row level security;
alter table public.medical_ai_logs enable row level security;

drop policy if exists study_sources_public_read on public.study_sources;
create policy study_sources_public_read on public.study_sources
  for select using (active = true);

drop policy if exists study_sources_admin_all on public.study_sources;
create policy study_sources_admin_all on public.study_sources
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists medical_ai_texts_public_read on public.medical_ai_texts;
create policy medical_ai_texts_public_read on public.medical_ai_texts
  for select using (published = true and archived = false);

drop policy if exists medical_ai_texts_admin_all on public.medical_ai_texts;
create policy medical_ai_texts_admin_all on public.medical_ai_texts
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists medical_ai_categories_public_read on public.medical_ai_categories;
create policy medical_ai_categories_public_read on public.medical_ai_categories
  for select using (true);

drop policy if exists medical_ai_categories_admin_all on public.medical_ai_categories;
create policy medical_ai_categories_admin_all on public.medical_ai_categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists medical_ai_quality_admin_read on public.medical_ai_quality;
create policy medical_ai_quality_admin_read on public.medical_ai_quality
  for select using (public.is_admin());

drop policy if exists medical_ai_quality_admin_all on public.medical_ai_quality;
create policy medical_ai_quality_admin_all on public.medical_ai_quality
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists medical_ai_logs_admin_all on public.medical_ai_logs;
create policy medical_ai_logs_admin_all on public.medical_ai_logs
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed: universities (CZ, SK, EU, world)
-- ---------------------------------------------------------------------------
insert into public.study_sources (slug, name, url, region, institution_type, specialties, languages)
values
  ('lf1-uk', '1. LF UK', 'https://www.lf1.cuni.cz/', 'cz', 'university', array['rheumatology','immunology','internal'], array['cs','en']),
  ('lf2-uk', '2. LF UK', 'https://www.lf2.cuni.cz/', 'cz', 'university', array['rheumatology','internal','pharmacology'], array['cs','en']),
  ('lf3-uk', '3. LF UK', 'https://www.lf3.cuni.cz/', 'cz', 'university', array['rheumatology','neurology','dermatology'], array['cs','en']),
  ('lf-mu-brno', 'LF MU Brno', 'https://www.med.muni.cz/', 'cz', 'university', array['rheumatology','orthopedics','internal'], array['cs','en','de']),
  ('lf-upol', 'LF UPOL', 'https://www.lf.upol.cz/', 'cz', 'university', array['internal','pharmacology'], array['cs','en']),
  ('lf-ou-ostrava', 'LF OU Ostrava', 'https://www.lf.osu.cz/', 'cz', 'university', array['internal','rheumatology'], array['cs','en']),
  ('lf-plzen', 'LF Plzeň', 'https://www.lfp.cuni.cz/', 'cz', 'university', array['internal','pharmacology'], array['cs','en','de']),
  ('lf-hk', 'LF Hradec Králové', 'https://www.lfhk.cuni.cz/', 'cz', 'university', array['internal','rheumatology'], array['cs','en']),
  ('ikem', 'IKEM', 'https://www.ikem.cz/', 'cz', 'hospital', array['internal','immunology','endocrinology'], array['cs','en']),
  ('fn-motol', 'FN Motol', 'https://www.fnmotol.cz/', 'cz', 'hospital', array['rheumatology','pediatrics','internal'], array['cs','en']),
  ('fn-brno', 'FN Brno', 'https://www.fnbrno.cz/', 'cz', 'hospital', array['internal','rheumatology'], array['cs','en']),
  ('fn-ostrava', 'FN Ostrava', 'https://www.fno.cz/', 'cz', 'hospital', array['internal','orthopedics'], array['cs','en']),
  ('lf-uk-bratislava', 'LF UK Bratislava', 'https://www.fmed.uniba.sk/', 'sk', 'university', array['internal','rheumatology'], array['sk','en','de']),
  ('lf-upjs-kosice', 'LF UPJŠ Košice', 'https://www.upjs.sk/', 'sk', 'university', array['internal','pharmacology'], array['sk','en']),
  ('lf-uk-martin', 'LF UK Martin', 'https://www.jfmed.uniba.sk/', 'sk', 'university', array['internal','rheumatology'], array['sk','en']),
  ('charite-berlin', 'Charité Berlin', 'https://www.charite.de/', 'eu', 'university', array['rheumatology','immunology','internal'], array['de','en']),
  ('karolinska', 'Karolinska Institutet', 'https://ki.se/', 'eu', 'university', array['rheumatology','immunology'], array['en','sv']),
  ('oxford-med', 'Oxford Medical School', 'https://www.medsci.ox.ac.uk/', 'eu', 'university', array['internal','rheumatology'], array['en']),
  ('cambridge-clinical', 'Cambridge Clinical School', 'https://www.medschl.cam.ac.uk/', 'eu', 'university', array['internal','immunology'], array['en']),
  ('univ-vienna', 'University of Vienna', 'https://www.meduniwien.ac.at/', 'eu', 'university', array['internal','rheumatology'], array['de','en']),
  ('univ-zurich', 'University of Zurich', 'https://www.med.uzh.ch/', 'eu', 'university', array['rheumatology','internal'], array['de','en','fr']),
  ('univ-helsinki', 'University of Helsinki', 'https://www.helsinki.fi/', 'eu', 'university', array['immunology','internal'], array['en','fi']),
  ('harvard-med', 'Harvard Medical School', 'https://hms.harvard.edu/', 'world', 'university', array['rheumatology','immunology','internal'], array['en']),
  ('mayo-clinic', 'Mayo Clinic', 'https://www.mayoclinic.org/', 'world', 'hospital', array['rheumatology','internal'], array['en']),
  ('johns-hopkins', 'Johns Hopkins', 'https://www.hopkinsmedicine.org/', 'world', 'university', array['internal','immunology'], array['en']),
  ('stanford-medicine', 'Stanford Medicine', 'https://med.stanford.edu/', 'world', 'university', array['immunology','rheumatology'], array['en']),
  ('cleveland-clinic', 'Cleveland Clinic', 'https://my.clevelandclinic.org/', 'world', 'hospital', array['rheumatology','orthopedics'], array['en']),
  ('tokyo-univ', 'Tokyo University', 'https://www.u-tokyo.ac.jp/', 'world', 'university', array['internal','rheumatology'], array['en','ja']),
  ('seoul-national', 'Seoul National University', 'https://www.snu.ac.kr/', 'world', 'university', array['internal','immunology'], array['en','ko'])
on conflict (slug) do nothing;

-- V4d documentation seed
insert into public.documentation (version, content, admin_only)
values (
  'v4d',
  'V4d: Modul /odborne — odborné AI texty, study_sources (univerzity CZ/SK/EU/svět), medical_ai_texts, kvalita (duplicity, relevance, jazyk), automatická kategorizace, překlady do češtiny, shrnutí pro lékaře/pacienty, cron medical-ai-fetch (9:00 UTC), edge function medical-ai-fetch.',
  false
)
on conflict (version) do nothing;

-- ---------------------------------------------------------------------------
-- Seed: category taxonomy
-- ---------------------------------------------------------------------------
insert into public.medical_ai_categories (slug, label_cs, category_type, sort_order)
values
  ('ra', 'Revmatoidní artritida (RA)', 'diagnosis', 10),
  ('psa', 'Psoriatická artritida (PsA)', 'diagnosis', 20),
  ('as', 'Ankylózující spondylitida (AS)', 'diagnosis', 30),
  ('oa', 'Osteoartróza (OA)', 'diagnosis', 40),
  ('rct', 'Randomizovaná studie (RCT)', 'study_type', 10),
  ('meta-analysis', 'Meta-analýza', 'study_type', 20),
  ('cohort', 'Kohortní studie', 'study_type', 30),
  ('case-series', 'Série případů', 'study_type', 40),
  ('level-1', 'Úroveň důkazů I', 'evidence_level', 10),
  ('level-2', 'Úroveň důkazů II', 'evidence_level', 20),
  ('level-3', 'Úroveň důkazů III', 'evidence_level', 30),
  ('high-impact', 'Vysoký klinický dopad', 'clinical_impact', 10),
  ('moderate-impact', 'Střední klinický dopad', 'clinical_impact', 20),
  ('practice-change', 'Doporučení změny praxe', 'practice', 10),
  ('monitoring', 'Monitorování / follow-up', 'practice', 20),
  ('rheumatology', 'Revmatologie', 'specialty', 10),
  ('immunology', 'Imunologie', 'specialty', 20),
  ('internal', 'Interní medicína', 'specialty', 30),
  ('pharmacology', 'Farmakologie', 'specialty', 40),
  ('orthopedics', 'Ortopedie', 'specialty', 50),
  ('neurology', 'Neurologie', 'specialty', 60),
  ('dermatology', 'Dermatologie', 'specialty', 70),
  ('endocrinology', 'Endokrinologie', 'specialty', 80),
  ('lang-cs', 'Čeština', 'language', 10),
  ('lang-sk', 'Slovenština', 'language', 20),
  ('lang-en', 'Angličtina', 'language', 30),
  ('lang-de', 'Němčina', 'language', 40),
  ('lang-fr', 'Francouzština', 'language', 50)
on conflict (slug) do nothing;
