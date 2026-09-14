import { runManagementQuery } from "@/lib/supabase/management-api";

export const MARKETPLACE_DESK_SQL = `
create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('offer', 'demand', 'question')),
  status text not null default 'visible',
  company text not null,
  title text not null,
  summary text not null,
  category text,
  region text,
  cert text,
  contact_name text,
  contact_email text,
  phone text,
  source text not null default 'form',
  auto_replied_at timestamptz,
  reply_topic text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists marketplace_listings_kind_idx
  on public.marketplace_listings (kind, status, created_at desc);

create table if not exists public.marketplace_messages (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.marketplace_listings(id) on delete set null,
  direction text not null check (direction in ('inbound', 'outbound')),
  from_email text,
  to_email text,
  subject text,
  body text,
  topic text,
  created_at timestamptz not null default now()
);

create index if not exists marketplace_messages_created_idx
  on public.marketplace_messages (created_at desc);

alter table public.marketplace_listings enable row level security;
alter table public.marketplace_messages enable row level security;
`;

export type MarketplaceSchemaResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

let schemaReady = false;

export async function applyMarketplaceDeskSchema(): Promise<MarketplaceSchemaResult> {
  if (schemaReady) return { ok: true, skipped: true };
  const outcome = await runManagementQuery(MARKETPLACE_DESK_SQL);
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
