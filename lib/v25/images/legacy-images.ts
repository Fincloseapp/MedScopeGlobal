import { hasBadUnsplashId } from "./bad-unsplash-ids";

/** Legacy / placeholder images that must be replaced by v25 photo pipeline. */

const LEGACY_PATTERNS = [
  /images\.unsplash\.com/i,
  /source\.unsplash\.com/i,
  /picsum\.photos/i,
  /placeholder/i,
  /via\.placeholder/i,
  /black-hands/i,
  /dark-hands/i,
  /dark-skinned-hands/i,
  /african-hands/i,
  /brown-hands/i,
  /non-european/i,
  /us-hospital/i,
  /american-hospital/i,
  /stock-photo.*hands/i,
  /hands.*dark/i,
  /dark.*gloves/i,
];

const PURGE_PATTERNS = [
  ...LEGACY_PATTERNS,
  /\/hands-dark/i,
  /\/dark_skin/i,
  /hospital-usa/i,
  /us-medical/i,
  /african-american/i,
  /stock.*patient.*face/i,
];

/** v25.1 SVG placeholder cards and on-demand render stubs — not production covers. */
const PLACEHOLDER_PATTERNS = [
  /\.svg(\?|$)/i,
  /\/api\/v25\/images\/render/i,
  /MedScopeGlobal\s*v25/i,
  /Neutral\s*·\s*European/i,
];

/** Raster images persisted in Supabase media or local asset API (non-SVG). */
const RASTER_OK_PATTERNS = [
  /supabase\.co\/storage\/v1\/object\/public\/media\/v25-images\/.*\.(jpg|jpeg|png|webp)/i,
  /\/api\/v25\/images\/asset\/.*\.(jpg|jpeg|png|webp)/i,
];

export function isPlaceholderImageUrl(url?: string | null): boolean {
  if (!url?.trim()) return false;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(url));
}

export function isLegacyImageUrl(url?: string | null): boolean {
  if (!url?.trim()) return true;
  const u = url.trim();
  if (hasBadUnsplashId(u)) return true;
  if (isPlaceholderImageUrl(u)) return true;
  if (RASTER_OK_PATTERNS.some((re) => re.test(u))) return false;
  return LEGACY_PATTERNS.some((re) => re.test(u));
}

/** v27.3 — aggressive purge: legacy + bad Unsplash + content heuristics. */
export function isPurgeableImageUrl(url?: string | null): boolean {
  if (!url?.trim()) return false;
  const u = url.trim();
  if (hasBadUnsplashId(u)) return true;
  if (isPlaceholderImageUrl(u)) return true;
  if (PURGE_PATTERNS.some((re) => re.test(u))) return true;
  if (/images\.unsplash\.com/i.test(u) && !RASTER_OK_PATTERNS.some((re) => re.test(u))) return true;
  return isLegacyImageUrl(u);
}

export function isV25ImageUrl(url?: string | null): boolean {
  if (!url) return false;
  return RASTER_OK_PATTERNS.some((re) => re.test(url));
}

/** Extract image URLs from HTML content for purge scan. */
export function extractContentImageUrls(html?: string | null): string[] {
  if (!html) return [];
  const urls: string[] = [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(String(html))) !== null) {
    urls.push(m[1]);
  }
  return urls;
}
