import { createServiceRoleClient } from "@/lib/supabase/service";

interface Bucket {
  count: number;
  resetAt: number;
}

/** In-memory fallback for dev / single-instance. */
const memoryBuckets = new Map<string, Bucket>();

export function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const current = memoryBuckets.get(key);

  if (!current || current.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return { ok: true, remaining: limit - current.count };
}

/** Persistent rate limit via Supabase RPC (production). */
export async function persistentRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: boolean; remaining: number; retryAfter?: number }> {
  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs,
    });

    if (error || !data) {
      return memoryRateLimit(key, limit, windowMs);
    }

    const result = data as {
      ok: boolean;
      remaining: number;
      retry_after_ms?: number;
    };

    return {
      ok: result.ok,
      remaining: result.remaining ?? 0,
      retryAfter: result.retry_after_ms
        ? Math.ceil(result.retry_after_ms / 1000)
        : undefined,
    };
  } catch {
    return memoryRateLimit(key, limit, windowMs);
  }
}

const STATIC_ASSET = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|mjs|map|woff2?|ttf|eot)$/i;

/** Paths that should never consume rate-limit budget (health probes, Next assets). */
export function isRateLimitExemptPath(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return true;
  if (STATIC_ASSET.test(pathname)) return true;
  if (pathname === "/favicon.ico" || pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return true;
  }
  if (pathname.includes("/health")) return true;
  return false;
}

/** Next.js RSC / prefetch sub-requests — one user navigation fans out into many. */
export function isNextJsSubRequest(request: Request): boolean {
  if (request.headers.get("rsc") === "1") return true;
  if (request.headers.get("next-router-prefetch") === "1") return true;
  if (request.headers.get("next-router-state-tree")) return true;
  if (request.headers.get("purpose") === "prefetch") return true;
  return false;
}

export function isRelaxedPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/academy") ||
    pathname.startsWith("/articles") ||
    pathname.startsWith("/verejnost")
  );
}

/** 120 req/min per IP — API routes guarded by withApiGuard */
export async function checkIpRateLimit(ip: string) {
  return persistentRateLimit(`ip:${ip}`, 120, 60_000);
}

/** 100 req/hour per user */
export async function checkUserRateLimit(userId: string) {
  return persistentRateLimit(`user:${userId}`, 100, 3_600_000);
}

/** Public HTML navigations — relaxed routes get a higher budget than the rest. */
export async function checkPublicPageRateLimit(ip: string, pathname: string) {
  const limit = isRelaxedPublicPath(pathname) ? 300 : 120;
  return persistentRateLimit(`public:${ip}`, limit, 60_000);
}
