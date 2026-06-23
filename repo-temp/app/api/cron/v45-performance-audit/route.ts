import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { auditRoutePerformance } from "@/lib/v45/performance/analyzer";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://medscopeglobal.com";
  const audit = await auditRoutePerformance(base);

  return NextResponse.json({
    ok: true,
    phase: "v45-performance-audit",
    avg_latency_ms: audit.avg_latency_ms,
    slow_routes: audit.slow_routes,
    suggestions: audit.suggestions,
    metrics: audit.metrics,
    audited_at: audit.audited_at,
  });
}
