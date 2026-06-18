import { NextResponse, type NextRequest } from "next/server";
import { getClientIp } from "@/lib/security/client-ip";
import { applySecurityMiddleware } from "@/lib/security/middleware-security";
import { shouldBlockBot } from "@/lib/v30/security/bot-shield";
import { writeAuditLog } from "@/lib/v30/security/audit-log";
import { checkApiRateLimit } from "@/lib/v30/security/rate-limit";
import { applySecurityHeaders } from "@/lib/v30/security/headers";
import { scanQueryString } from "@/lib/v30/security/waf";
import { isAdminIpAllowed } from "@/lib/v30/security/admin-guard";

/** v30 security layer — runs before legacy security + locale middleware. */
export async function applyV30SecurityMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const ua = request.headers.get("user-agent");
  const { pathname, search } = request.nextUrl;

  const waf = scanQueryString(search);
  if (waf.blocked) {
    await writeAuditLog({
      type: "waf:blocked",
      ip,
      endpoint: pathname,
      severity: "warning",
      details: { reason: waf.reason, pattern: waf.pattern },
    });
    return new NextResponse("Bad Request", { status: 400 });
  }

  if (pathname.startsWith("/admin") && !isAdminIpAllowed(request)) {
    await writeAuditLog({
      type: "admin:ip_denied",
      ip,
      endpoint: pathname,
      severity: "warning",
    });
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (shouldBlockBot(ua, pathname)) {
    await writeAuditLog({
      type: "bot:blocked",
      ip,
      endpoint: pathname,
      severity: "info",
      details: { userAgent: ua?.slice(0, 200) },
    });
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (pathname.startsWith("/api/")) {
    const limit = await checkApiRateLimit(ip, pathname);
    if (!limit.ok) {
      await writeAuditLog({
        type: "rate_limit:api",
        ip,
        endpoint: pathname,
        severity: "warning",
        details: { retryAfter: limit.retryAfter, backend: limit.backend },
      });
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter ?? 60) },
      });
    }
  }

  const legacy = await applySecurityMiddleware(request);
  if (legacy) return applySecurityHeaders(legacy);

  return null;
}

export function wrapWithSecurityHeaders(response: NextResponse): NextResponse {
  return applySecurityHeaders(response);
}
