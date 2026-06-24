/** In-memory edge cache for v19 article batches (TTL 5–15 min). */

type CacheEntry<T> = { value: T; expiresAt: number };

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = Number(process.env.V19_CACHE_TTL_MS ?? 10 * 60 * 1000);

export function v19CacheGet<T>(key: string): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return null;
  }
  return hit.value as T;
}

export function v19CacheSet<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function v19CacheStats() {
  const now = Date.now();
  let active = 0;
  for (const entry of store.values()) {
    if (entry.expiresAt > now) active += 1;
  }
  return { entries: store.size, active };
}
