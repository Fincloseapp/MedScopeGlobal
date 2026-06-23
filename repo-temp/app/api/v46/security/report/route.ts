import { NextResponse } from "next/server";
import { V46_UI_VERSION, V46_UI_BUILD_STAMP, V46_COMPOSITE_LABEL, V46_LAST_STABLE_SHA } from "@/lib/v46/version";
import { getThreatDetectorStatus } from "@/lib/v46/security/threat-detector";
import { runVulnerabilityScan } from "@/lib/v46/security/vulnerability-scan";
import { getSecurityHeadersStatus } from "@/lib/v30/security/headers";
import { getRateLimitConfig } from "@/lib/v30/security/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  const vuln = await runVulnerabilityScan();

  return NextResponse.json({
    status: "ok",
    ok: true,
    version: V46_UI_VERSION,
    composite: V46_COMPOSITE_LABEL,
    buildStamp: V46_UI_BUILD_STAMP,
    last_stable_sha: V46_LAST_STABLE_SHA,
    security: {
      headers: getSecurityHeadersStatus(),
      rateLimit: getRateLimitConfig(),
      threatDetector: getThreatDetectorStatus(),
      vulnerability: vuln,
    },
    admin: "/admin/security",
    cron: "/api/cron/v46-security-weekly",
    generatedAt: new Date().toISOString(),
  });
}
