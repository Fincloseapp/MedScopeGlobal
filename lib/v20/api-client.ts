/**
 * v20 client fetch — retry, cache, rate-limit friendly.
 */

type CacheEntry = { data: unknown; at: number };

const memoryCache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 60_000;

export async function fetchV20Json<T>(
  url: string,
  opts?: { ttlMs?: number; retries?: number; init?: RequestInit }
): Promise<T> {
  const ttl = opts?.ttlMs ?? DEFAULT_TTL_MS;
  const retries = opts?.retries ?? 2;
  const cached = memoryCache.get(url);
  if (cached && Date.now() - cached.at < ttl) {
    return cached.data as T;
  }

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...opts?.init,
        headers: { Accept: "application/json", ...(opts?.init?.headers ?? {}) },
      });
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("retry-after") ?? 2);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as T;
      memoryCache.set(url, { data, at: Date.now() });
      return data;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }
  throw lastError ?? new Error("fetch failed");
}

export function getV20FallbackArticles() {
  return [];
}
