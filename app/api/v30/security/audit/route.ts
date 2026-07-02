import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { listRecentAuditLogs } from "@/lib/v30/security/audit-log";
import { writeAuditLog } from "@/lib/v30/security/audit-log";

export const dynamic = "force-dynamic";

/** Internal cron — flush/aggregate security audit logs. */
export async function POST(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const recent = await listRecentAuditLogs(100);
  const critical = recent.filter((r) => r.severity === "critical").length;
  const warnings = recent.filter((r) => r.severity === "warning").length;

  await writeAuditLog({
    type: "audit:cron_flush",
    endpoint: "/api/v30/security/audit",
    severity: "info",
    details: { total: recent.length, critical, warnings },
  });

  return NextResponse.json({
    ok: true,
    flushed: recent.length,
    critical,
    warnings,
    generatedAt: new Date().toISOString(),
  });
}
