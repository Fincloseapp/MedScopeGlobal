import { runManagementQuery } from "@/lib/supabase/management-api";

export const ADS_REQUESTS_REVIEW_SQL = `
alter table if exists public.ads_requests add column if not exists buyer_address text;
alter table if exists public.ads_requests add column if not exists locale text;
alter table if exists public.ads_requests add column if not exists editorial_review jsonb;
alter table if exists public.ads_requests add column if not exists decision text;
alter table if exists public.ads_requests add column if not exists decided_at timestamptz;
alter table if exists public.ads_requests add column if not exists decided_by text;
alter table if exists public.ads_requests add column if not exists denial_reason text;
alter table if exists public.ads_requests add column if not exists variable_symbol text;
alter table if exists public.ads_requests add column if not exists payment_method text;
alter table if exists public.ads_requests add column if not exists invoice_sent_at timestamptz;
alter table if exists public.ads_requests add column if not exists approved_at timestamptz;
alter table if exists public.ads_requests add column if not exists paid_at timestamptz;
alter table if exists public.ads_requests add column if not exists stripe_session_id text;
`;

export async function applyAdsRequestsSchema(): Promise<{ ok: boolean; error?: string }> {
  try {
    await runManagementQuery(ADS_REQUESTS_REVIEW_SQL);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "ads schema failed" };
  }
}
