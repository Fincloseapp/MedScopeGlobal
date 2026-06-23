import { SITE } from "@/lib/config/site";
import { getClientIp } from "@/lib/security/client-ip";
import { verifyTurnstileToken } from "@/lib/security/captcha";
import { checkIpRateLimit, checkUserRateLimit } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/security-log";
import { shouldBlockScraper } from "@/lib/security/scraper-filter";
import { NextResponse } from "next/server";

export function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const requestHost = request.headers.get("host");
  const expectedHosts = new Set(
    [requestHost, new URL(SITE.url).host, "localhost:3000", "127.0.0.1:3000"].filter(
      Boolean
    )
  );
  try {
    return expectedHosts.has(new URL(origin).host);
  } catch {
    return false;
  }
}

export interface ApiGuardOptions {
  requireCaptcha?: boolean;
  requireAuth?: boolean;
  userId?: string | null;
  action?: string;
}

export async function withApiGuard(
  request: Request,
  options: ApiGuardOptions = {}
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const ip = getClientIp(request);
  const ua = request.headers.get("user-agent");
  const action = options.action ?? "api_request";

  if (!assertSameOrigin(request)) {
    await logSecurityEvent({
      ip,
      action: `${action}:origin_blocked`,
      status: "blocked",
      details: { origin: request.headers.get("origin") },
    });
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  const ipLimit = await checkIpRateLimit(ip);
  if (!ipLimit.ok) {
    await logSecurityEvent({
      ip,
      userId: options.userId,
      action: `${action}:rate_limit_ip`,
      status: "blocked",
      details: { retryAfter: ipLimit.retryAfter },
    });
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many requests", retryAfter: ipLimit.retryAfter },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter ?? 60) } }
      ),
    };
  }

  if (options.userId) {
    const userLimit = await checkUserRateLimit(options.userId);
    if (!userLimit.ok) {
      await logSecurityEvent({
        ip,
        userId: options.userId,
        action: `${action}:rate_limit_user`,
        status: "blocked",
      });
      return {
        ok: false,
        response: NextResponse.json({ error: "User rate limit exceeded" }, { status: 429 }),
      };
    }
  }

  if (shouldBlockScraper(ua, new URL(request.url).pathname)) {
    await logSecurityEvent({
      ip,
      action: `${action}:scraper_blocked`,
      status: "blocked",
      details: { userAgent: ua?.slice(0, 200) },
    });
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  if (options.requireCaptcha) {
    let token: string | undefined;
    try {
      const clone = request.clone();
      const body = await clone.json();
      token = body.captchaToken ?? body.turnstileToken;
    } catch {
      token = request.headers.get("x-turnstile-token") ?? undefined;
    }

    const captcha = await verifyTurnstileToken(token ?? "", ip);
    if (!captcha.ok) {
      await logSecurityEvent({
        ip,
        action: `${action}:captcha_failed`,
        status: "blocked",
        details: { error: captcha.error },
      });
      return {
        ok: false,
        response: NextResponse.json({ error: captcha.error ?? "CAPTCHA failed" }, { status: 403 }),
      };
    }
  }

  return { ok: true };
}
