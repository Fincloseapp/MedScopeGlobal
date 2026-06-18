import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runHealthMonitor } from "@/lib/v43/monitoring/health-engine";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const report = await runHealthMonitor();
  return NextResponse.json({
    ok: report.overall !== "critical",
    phase: "v43-health-monitor",
    overall: report.overall,
    score: report.score,
    checks: report.checks,
    auto_heal: report.auto_heal,
    last_stable_sha: report.last_stable_sha,
    generated_at: report.generated_at,
  });
}
