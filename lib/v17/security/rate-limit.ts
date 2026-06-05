const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

type RateBucket = { count: number; windowStart: number };

const buckets = new Map<string, RateBucket>();

/** In-memory placeholder rate limiter. */
export function checkRateLimit(ip: string): { allowed: boolean } {
  const key = ip || "unknown";
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  bucket.count += 1;
  return { allowed: bucket.count <= MAX_REQUESTS };
}

export function resetRateLimits(): void {
  buckets.clear();
}
