/** Legacy / placeholder images that must be replaced by v25 generator. */
const LEGACY_PATTERNS = [
  /images\.unsplash\.com/i,
  /source\.unsplash\.com/i,
  /picsum\.photos/i,
  /placeholder/i,
  /via\.placeholder/i,
];

const V25_OK_PATTERNS = [
  /\/api\/v25\/images\//i,
  /v25-images\//i,
  /supabase\.co\/storage/i,
  /medscopeglobal\.com/i,
  /\.svg(\?|$)/i,
];

export function isLegacyImageUrl(url?: string | null): boolean {
  if (!url?.trim()) return true;
  if (V25_OK_PATTERNS.some((re) => re.test(url))) return false;
  return LEGACY_PATTERNS.some((re) => re.test(url));
}

export function isV25ImageUrl(url?: string | null): boolean {
  if (!url) return false;
  return V25_OK_PATTERNS.some((re) => re.test(url));
}
