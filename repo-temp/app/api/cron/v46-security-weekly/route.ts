import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runVulnerabilityScan } from "@/lib/v46/security/vulnerability-scan";
import { getThreatDetectorStatus } from "@/lib/v46/security/threat-detector";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const vuln = await runVulnerabilityScan();
  return NextResponse.json({
    ok: true,
    phase: "v46-security-weekly",
    threatDetector: getThreatDetectorStatus(),
    vulnerability: vuln,
    generated_at: new Date().toISOString(),
  });
}
