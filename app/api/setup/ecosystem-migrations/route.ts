import { NextResponse } from "next/server";
import { applyEcosystemMigrations } from "@/lib/ecosystem/apply-migrations";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * One-time DDL for MediFlow + editorial ecosystem tables (20260825*).
 * GET /api/setup/ecosystem-migrations?secret=CRON_SECRET
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const querySecret = new URL(request.url).searchParams.get("secret");
  if (!secret || querySecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const outcome = await applyEcosystemMigrations();
    return NextResponse.json(outcome, { status: outcome.ok ? 200 : 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Migration apply failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
