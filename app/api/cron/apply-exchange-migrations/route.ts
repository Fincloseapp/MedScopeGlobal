import { NextResponse } from "next/server";
import { applyExchangeSchema } from "@/lib/exchange/apply-schema";
import { verifyCronOrCloudflareOperator } from "@/lib/v6/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * One-shot DDL for B2B Exchange tables (20260910* + 20260911*).
 * POST /api/cron/apply-exchange-migrations
 * Auth: Bearer CRON_SECRET, or a valid Cloudflare API token (user or account-owned).
 * Requires Worker secret SUPABASE_ACCESS_TOKEN.
 */
export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

async function handle(request: Request) {
  const denied = await verifyCronOrCloudflareOperator(request);
  if (denied) return denied;

  try {
    const outcome = await applyExchangeSchema();
    return NextResponse.json(outcome, { status: outcome.ok ? 200 : 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Exchange migration apply failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
