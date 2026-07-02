-- v25.1 — AI Image Selector + Generator registry

create table if not exists public.v25_images_snapshot (
  id text primary key default 'production',
  report jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.v25_image_runs (
  id uuid primary key default gen_random_uuid(),
  section text not null,
  slug text not null,
  source text not null default 'generator',
  ok boolean not null default true,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists v25_image_runs_section_idx on public.v25_image_runs (section, created_at desc);
