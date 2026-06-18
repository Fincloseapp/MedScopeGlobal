/**
 * v30 rate limiting — in-memory per-instance + optional Upstash Redis REST.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const memoryBuckets = new Map<string, Bucket>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfter?: number;
  backend: "memory" | "redis";
};

export function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const current = memoryBuckets.get(key);

  if (!current || current.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, backend: "memory" };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
      backend: "memory",
    };
  }

  current.count += 1;
  return { ok: true, remaining: limit - current.count, backend: "memory" };
}

function getRedisRestConfig(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ??
    process.env.REDIS_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ??
    process.env.REDIS_TOKEN?.trim();
  if (!url || !token || !url.startsWith("http")) return null;
  return { url: url.replace(/\/$/, ""), token };
}

async function redisRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  const cfg = getRedisRestConfig();
  if (!cfg) return null;

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const redisKey = `v30:rl:${key}`;

  try {
    const res = await fetch(`${cfg.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["EXPIRE", redisKey, windowSec, "NX"],
        ["TTL", redisKey],
      ]),
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { result?: unknown[] };
    const count = Number(data.result?.[0] ?? 0);
    const ttl = Number(data.result?.[2] ?? windowSec);

    if (count > limit) {
      return {
        ok: false,
        remaining: 0,
        retryAfter: Math.max(1, ttl),
        backend: "redis",
      };
    }

    return {
      ok: true,
      remaining: Math.max(0, limit - count),
      backend: "redis",
    };
  } catch {
    return null;
  }
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redis = await redisRateLimit(key, limit, windowMs);
  if (redis) return redis;
  return memoryRateLimit(key, limit, windowMs);
}

/** Endpoint-specific limits (per IP) */
export const ENDPOINT_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  default: { limit: 120, windowMs: 60_000 },
  checkout: { limit: 15, windowMs: 60_000 },
  webhook: { limit: 60, windowMs: 60_000 },
  auth: { limit: 20, windowMs: 60_000 },
  academy: { limit: 90, windowMs: 60_000 },
  admin: { limit: 40, windowMs: 60_000 },
  tts: { limit: 30, windowMs: 60_000 },
};

export function resolveEndpointBucket(pathname: string): keyof typeof ENDPOINT_LIMITS {
  if (pathname.includes("checkout") || pathname.includes("stripe/create")) return "checkout";
  if (pathname.includes("webhook")) return "webhook";
  if (pathname.includes("/auth") || pathname.includes("login")) return "auth";
  if (pathname.startsWith("/api/academy")) return "academy";
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) return "admin";
  if (pathname.startsWith("/api/tts") || pathname.startsWith("/api/voice") || pathname.includes("/video/voice")) return "tts";
  return "default";
}

export async function checkApiRateLimit(
  ip: string,
  pathname: string
): Promise<RateLimitResult> {
  const bucket = resolveEndpointBucket(pathname);
  const { limit, windowMs } = ENDPOINT_LIMITS[bucket];
  return checkRateLimit(`v30:api:${bucket}:${ip}`, limit, windowMs);
}

export function getRateLimitConfig() {
  return {
    backend: getRedisRestConfig() ? "redis" : "memory",
    endpoints: ENDPOINT_LIMITS,
  };
}
