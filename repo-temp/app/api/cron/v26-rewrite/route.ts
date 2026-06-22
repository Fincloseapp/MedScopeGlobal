import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runV26RewriteBackfill } from "@/lib/v26/backfill";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const batchSize = Number(url.searchParams.get("batch") ?? process.env.V26_REWRITE_BATCH ?? 8);
  const audience = url.searchParams.get("audience") as "public" | "student" | "physician" | "all" | null;

  const result = await runV26RewriteBackfill({
    batchSize,
    audience: audience ?? "all",
  });

  return NextResponse.json({ ok: result.errors.length === 0 || result.updated > 0, ...result });
}
