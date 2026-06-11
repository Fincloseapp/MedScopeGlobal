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
  /medscope\.data\/images/i,
  /\.svg(\?|$)/i,
];

/**
 * @param {string | null | undefined} url
 */
export function isLegacyImageUrl(url) {
  if (!url || !String(url).trim()) return true;
  const u = String(url);
  if (V25_OK_PATTERNS.some((re) => re.test(u))) return false;
  return LEGACY_PATTERNS.some((re) => re.test(u));
}

export function isV25ImageUrl(url) {
  if (!url) return false;
  return V25_OK_PATTERNS.some((re) => re.test(String(url)));
}
