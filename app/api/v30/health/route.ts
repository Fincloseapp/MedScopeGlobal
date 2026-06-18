import { NextResponse } from "next/server";
import { getAdminGuardStatus } from "@/lib/v30/security/admin-guard";
import { getBotShieldStatus } from "@/lib/v30/security/bot-shield";
import { getSecurityHeadersStatus } from "@/lib/v30/security/headers";
import { getRateLimitConfig } from "@/lib/v30/security/rate-limit";
import { getWafStatus } from "@/lib/v30/security/waf";
import { V30_UI_VERSION } from "@/lib/v30/version";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    ok: true,
    version: V30_UI_VERSION,
    service: "medscope-v30-security",
    timestamp: new Date().toISOString(),
    security: {
      headers: getSecurityHeadersStatus(),
      rateLimit: getRateLimitConfig(),
      botShield: getBotShieldStatus(),
      waf: getWafStatus(),
      adminGuard: getAdminGuardStatus(),
    },
    compat: {
      v29: "/api/v29/health",
      v31: "/api/v31/health",
      v32: "/api/v32/health",
    },
  });
}
