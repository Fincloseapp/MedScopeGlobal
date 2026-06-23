import { memoryRateLimit, persistentRateLimit } from "@/lib/security/rate-limit";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

export type V17RateLimitResult = {
  allowed: boolean;
  retryAfter?: number;
};

function rateLimitKey(job: string, ip: string): string {
  return `v17:${job}:${ip || "unknown"}`;
}

/** V17 rate limit — Supabase-backed with in-memory fallback. */
export async function checkRateLimit(
  ip: string,
  job = "v17"
): Promise<V17RateLimitResult> {
  const result = await persistentRateLimit(rateLimitKey(job, ip), MAX_REQUESTS, WINDOW_MS);
  return {
    allowed: result.ok,
    retryAfter: result.retryAfter,
  };
}

/** Sync in-memory check for tests / local-only callers. */
export function checkRateLimitMemory(ip: string, job = "v17"): V17RateLimitResult {
  const result = memoryRateLimit(rateLimitKey(job, ip), MAX_REQUESTS, WINDOW_MS);
  return {
    allowed: result.ok,
    retryAfter: result.retryAfter,
  };
}

export function resetRateLimits(): void {
  // persistent store is shared — tests use memory path via checkRateLimitMemory
}
