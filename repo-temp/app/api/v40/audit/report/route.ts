import { NextResponse } from "next/server";
import { generateAuditReport, persistAuditReport, listAuditReports } from "@/lib/v40/audit/engine";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const history = url.searchParams.get("history") === "1";

  if (history) {
    const reports = await listAuditReports(10);
    return NextResponse.json({ ok: true, version: "v40.0", reports });
  }

  const report = await generateAuditReport();
  const reportId = await persistAuditReport(report);

  return NextResponse.json({
    ok: true,
    version: "v40.0",
    report_id: reportId,
    report,
  });
}
