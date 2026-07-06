-- Pre-extracted text cache for legacy study materials (DOC, RTF, archives, etc.).
-- Populated by scripts/extract-student-material-text.mjs; read at runtime before live extraction.

alter table public.student_materials
  add column if not exists extracted_text text,
  add column if not exists extracted_kind text
    check (extracted_kind is null or extracted_kind in ('text', 'html')),
  add column if not exists text_extracted_at timestamptz;

create index if not exists student_materials_text_cache_idx
  on public.student_materials (text_extracted_at)
  where extracted_text is not null;

comment on column public.student_materials.extracted_text is
  'Cached plain text or HTML for reading mode; avoids runtime extraction on serverless.';
