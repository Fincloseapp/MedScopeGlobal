import { NextResponse } from "next/server";
import { V43_UI_VERSION, V43_UI_BUILD_STAMP } from "@/lib/v43/version";
import { runHealthMonitor } from "@/lib/v43/monitoring/health-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const report = await runHealthMonitor();
  return NextResponse.json({
    status: report.overall,
    ok: report.overall !== "critical",
    version: V43_UI_VERSION,
    buildStamp: V43_UI_BUILD_STAMP,
    score: report.score,
    report,
    cron: "/api/cron/v43-health-monitor",
    generatedAt: report.generated_at,
  });
}
