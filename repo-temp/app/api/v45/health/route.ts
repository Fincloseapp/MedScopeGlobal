import { NextResponse } from "next/server";
import { V45_UI_VERSION, V45_UI_BUILD_STAMP } from "@/lib/v45/version";
import { auditRoutePerformance } from "@/lib/v45/performance/analyzer";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://medscopeglobal.com";
  const audit = await auditRoutePerformance(base);

  return NextResponse.json({
    status: audit.slow_routes.length ? "degraded" : "ok",
    ok: true,
    version: V45_UI_VERSION,
    buildStamp: V45_UI_BUILD_STAMP,
    performance: audit,
    cron: "/api/cron/v45-performance-audit",
    generatedAt: audit.audited_at,
  });
}
