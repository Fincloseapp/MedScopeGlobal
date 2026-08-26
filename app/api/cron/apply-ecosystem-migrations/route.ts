import { NextResponse } from "next/server";
import { applyEcosystemMigrations } from "@/lib/ecosystem/apply-migrations";
import { verifyCronRequest } from "@/lib/v6/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * One-shot DDL for MediFlow + editorial ecosystem tables (20260825*).
 * POST /api/cron/apply-ecosystem-migrations
 * Auth: Bearer CRON_SECRET (same as other cron routes).
 * Requires Worker secret SUPABASE_ACCESS_TOKEN.
 */
export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

async function handle(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  try {
    const outcome = await applyEcosystemMigrations();
    return NextResponse.json(outcome, { status: outcome.ok ? 200 : 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Migration apply failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
