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

/** 10 req/min per IP */
export async function checkIpRateLimit(ip: string) {
  return persistentRateLimit(`ip:${ip}`, 10, 60_000);
}

/** 100 req/hour per user */
export async function checkUserRateLimit(userId: string) {
  return persistentRateLimit(`user:${userId}`, 100, 3_600_000);
}

/** Public page rate limit — 60 req/min per IP */
export async function checkPublicPageRateLimit(ip: string) {
  return persistentRateLimit(`public:${ip}`, 60, 60_000);
}
