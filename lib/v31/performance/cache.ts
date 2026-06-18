/** v31 cache helpers — Cache-Control + ISR revalidate tags */

export const V31_CACHE_TAGS = {
  academyCourses: "v31-academy-courses",
  academyHealth: "v31-academy-health",
  siteHealth: "v31-site-health",
  homepage: "v31-homepage",
} as const;

export function publicCacheHeaders(maxAgeSec: number, swrSec = 600): Record<string, string> {
  return {
    "Cache-Control": `public, s-maxage=${maxAgeSec}, stale-while-revalidate=${swrSec}`,
    "Vercel-CDN-Cache-Control": `public, s-maxage=${maxAgeSec}`,
  };
}

export function privateNoCacheHeaders(): Record<string, string> {
  return {
    "Cache-Control": "private, no-cache, no-store, must-revalidate",
  };
}

export function jsonWithCache<T>(body: T, maxAgeSec: number) {
  return {
    body,
    headers: publicCacheHeaders(maxAgeSec),
  };
}
