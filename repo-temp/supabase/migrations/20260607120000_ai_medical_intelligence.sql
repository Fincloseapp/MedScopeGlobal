-- AI Medical Intelligence — logging (additive, SAFE UPDATE)

create table if not exists public.ai_medical_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  assistant_type text not null check (
    assistant_type in (
      'doctor',
      'patient',
      'research',
      'legislativa',
      'leky',
      'studie',
      'univerzity'
    )
  ),
  query text not null,
  response text not null,
  language text not null default 'cs' check (language in ('cs', 'sk', 'en', 'de', 'fr')),
  output_type text not null default 'professional' check (output_type in ('professional', 'patient')),
  specialty text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_medical_logs_created_idx
  on public.ai_medical_logs (created_at desc);

create index if not exists ai_medical_logs_assistant_idx
  on public.ai_medical_logs (assistant_type, created_at desc);

alter table public.ai_medical_logs enable row level security;

drop policy if exists ai_medical_logs_admin on public.ai_medical_logs;
create policy ai_medical_logs_admin on public.ai_medical_logs
  for all using (public.is_admin()) with check (public.is_admin());

-- Service role inserts from API (no public insert policy)

insert into public.documentation (version, content, admin_only)
values (
  'ai-medical',
  'AI Medical Intelligence: /ai-medical — 7 asistentů (lékař, pacient, výzkum, legislativa, léky, studie, univerzity). Vyhledávání Supabase, generování shrnutí, doporučení, klinických závěrů, logování do ai_medical_logs.',
  false
)
on conflict (version) do nothing;
