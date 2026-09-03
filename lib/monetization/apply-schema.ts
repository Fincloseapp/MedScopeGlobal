import { runManagementQuery } from "@/lib/supabase/management-api";

/** Idempotent DDL — applied from Worker cron / first newsletter signup. */
export const NEWSLETTER_SUBSCRIBERS_SQL = `
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale text not null default 'cs',
  segment text not null default 'public',
  source text,
  created_at timestamptz not null default now(),
  constraint newsletter_subscribers_segment_chk
    check (segment in ('public', 'doctors')),
  constraint newsletter_subscribers_email_segment_key unique (email, segment)
);

alter table public.newsletter_subscribers
  add column if not exists unsubscribed_at timestamptz;

alter table public.newsletter_subscribers
  add column if not exists last_brief_sent_at timestamptz;

create index if not exists newsletter_subscribers_created_idx
  on public.newsletter_subscribers (created_at desc);

create index if not exists newsletter_subscribers_locale_idx
  on public.newsletter_subscribers (locale);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists newsletter_subscribers_admin_read on public.newsletter_subscribers;

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_admin'
  ) then
    create policy newsletter_subscribers_admin_read on public.newsletter_subscribers
      for select to authenticated
      using (public.is_admin());
  end if;
end $$;
`;

export type SchemaApplyResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

let schemaReady = false;

export async function applyNewsletterSubscriberSchema(): Promise<SchemaApplyResult> {
  if (schemaReady) return { ok: true, skipped: true };

  const outcome = await runManagementQuery(NEWSLETTER_SUBSCRIBERS_SQL);
  if (outcome.ok) {
    schemaReady = true;
    return { ok: true };
  }

  if (/already exists|duplicate key|relation .* already exists/i.test(outcome.message)) {
    schemaReady = true;
    return { ok: true, skipped: true };
  }

  return { ok: false, error: outcome.message };
}

export function markNewsletterSchemaReady(): void {
  schemaReady = true;
}

export const EMAIL_LOGS_PROVIDER_SQL = `
do $$
declare
  con name;
begin
  if to_regclass('public.email_logs') is null then
    return;
  end if;
  for con in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'email_logs'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%provider%'
  loop
    execute format('alter table public.email_logs drop constraint %I', con);
  end loop;
  alter table public.email_logs
    add constraint email_logs_provider_check
    check (provider in ('sendgrid', 'smtp', 'none', 'cloudflare'));
end $$;
`;

let emailLogSchemaReady = false;

export async function applyEmailLogProviderSchema(): Promise<SchemaApplyResult> {
  if (emailLogSchemaReady) return { ok: true, skipped: true };
  const outcome = await runManagementQuery(EMAIL_LOGS_PROVIDER_SQL);
  if (outcome.ok || /already exists|duplicate/i.test(outcome.message)) {
    emailLogSchemaReady = true;
    return { ok: true };
  }
  return { ok: false, error: outcome.message };
}

export const MONETIZATION_SETTINGS_SQL = `
create table if not exists public.monetization_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.monetization_settings enable row level security;

drop policy if exists monetization_settings_admin_all on public.monetization_settings;

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_admin'
  ) then
    create policy monetization_settings_admin_all on public.monetization_settings
      for all to authenticated
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;
`;

let settingsReady = false;

export async function applyMonetizationSettingsSchema(): Promise<SchemaApplyResult> {
  if (settingsReady) return { ok: true, skipped: true };
  const outcome = await runManagementQuery(MONETIZATION_SETTINGS_SQL);
  if (outcome.ok || /already exists|duplicate key/i.test(outcome.message)) {
    settingsReady = true;
    return { ok: true };
  }
  return { ok: false, error: outcome.message };
}
