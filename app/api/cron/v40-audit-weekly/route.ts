import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { generateAuditReport, persistAuditReport } from "@/lib/v40/audit/engine";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const report = await generateAuditReport();
  const reportId = await persistAuditReport(report);

  return NextResponse.json({
    ok: true,
    phase: "v40.0-audit-weekly",
    report_id: reportId,
    score: report.summary.score,
    status: report.summary.status,
    generatedAt: report.generated_at,
  });
}
