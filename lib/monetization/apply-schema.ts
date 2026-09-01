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

create index if not exists newsletter_subscribers_created_idx
  on public.newsletter_subscribers (created_at desc);

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
