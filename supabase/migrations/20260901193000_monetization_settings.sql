create table if not exists public.monetization_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.monetization_settings enable row level security;
