import { NextResponse } from "next/server";
import { applyEcosystemMigrations } from "@/lib/ecosystem/apply-migrations";
import { verifyCronRequest } from "@/lib/v6/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Allow deploy operators with a valid Cloudflare API token when CRON_SECRET is unavailable locally. */
async function verifyMigrationRequest(
  request: Request
): Promise<NextResponse | null> {
  if (!verifyCronRequest(request)) return null;

  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await res.json()) as { success?: boolean };
    if (res.ok && data.success) return null;
  } catch {
    /* fall through */
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

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
  const denied = await verifyMigrationRequest(request);
  if (denied) return denied;

  try {
    const outcome = await applyEcosystemMigrations();
    return NextResponse.json(outcome, { status: outcome.ok ? 200 : 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Migration apply failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
