import { NextResponse, type NextRequest } from "next/server";
import { getClientIp } from "@/lib/security/client-ip";
import {
  checkPublicPageRateLimit,
  isNextJsSubRequest,
  isRateLimitExemptPath,
} from "@/lib/security/rate-limit";
import { shouldBlockScraper } from "@/lib/security/scraper-filter";
import { logSecurityEvent } from "@/lib/security/security-log";

/** Security checks for middleware — additive layer. */
export async function applySecurityMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const ua = request.headers.get("user-agent");
  const pathname = request.nextUrl.pathname;

  if (shouldBlockScraper(ua, pathname)) {
    await logSecurityEvent({
      ip,
      action: "middleware:scraper_blocked",
      status: "blocked",
      details: { pathname, userAgent: ua?.slice(0, 200) },
    });
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/admin") &&
    !isRateLimitExemptPath(pathname) &&
    !isNextJsSubRequest(request)
  ) {
    const limit = await checkPublicPageRateLimit(ip, pathname);
    if (!limit.ok) {
      await logSecurityEvent({
        ip,
        action: "middleware:public_rate_limit",
        status: "blocked",
        details: { pathname },
      });
      return new NextResponse("Too Many Requests", {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter ?? 60) },
      });
    }
  }

  return null;
}
