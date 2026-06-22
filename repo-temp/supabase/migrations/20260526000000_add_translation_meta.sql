-- Add metadata columns for machine translations
alter table if exists public.article_translations
add column if not exists machine_translated boolean default true;

alter table if exists public.article_translations
add column if not exists translation_provider text;

alter table if exists public.article_translations
add column if not exists reviewed boolean default false;

-- Ensure index or constraints are unchanged; existing primary key (article_id, locale) remains.
