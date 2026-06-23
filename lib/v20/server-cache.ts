/** v20.1 — lightweight in-memory API response cache (per serverless instance). */

type Entry = { data: unknown; at: number };

const store = new Map<string, Entry>();

export function getCached<T>(key: string, ttlMs: number): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > ttlMs) {
    store.delete(key);
    return null;
  }
  return hit.data as T;
}

export function setCached(key: string, data: unknown): void {
  store.set(key, { data, at: Date.now() });
}

export function cacheKey(parts: Record<string, string | number>): string {
  return Object.entries(parts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}
