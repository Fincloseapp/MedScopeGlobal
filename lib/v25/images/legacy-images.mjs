/** Legacy / placeholder images that must be replaced by v25 photo pipeline. */

const LEGACY_PATTERNS = [
  /images\.unsplash\.com/i,
  /source\.unsplash\.com/i,
  /picsum\.photos/i,
  /placeholder/i,
  /via\.placeholder/i,
  /black-hands/i,
  /dark-hands/i,
  /african-hands/i,
  /stock-photo.*hands/i,
];

const PLACEHOLDER_PATTERNS = [
  /\.svg(\?|$)/i,
  /\/api\/v25\/images\/render/i,
  /MedScopeGlobal\s*v25/i,
  /Neutral\s*·\s*European/i,
];

const RASTER_OK_PATTERNS = [
  /supabase\.co\/storage\/v1\/object\/public\/media\/v25-images\/.*\.(jpg|jpeg|png|webp)/i,
  /\/api\/v25\/images\/asset\/.*\.(jpg|jpeg|png|webp)/i,
];

export function isPlaceholderImageUrl(url) {
  if (!url || !String(url).trim()) return false;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(String(url)));
}

export function isLegacyImageUrl(url) {
  if (!url || !String(url).trim()) return true;
  const u = String(url);
  if (isPlaceholderImageUrl(u)) return true;
  if (RASTER_OK_PATTERNS.some((re) => re.test(u))) return false;
  return LEGACY_PATTERNS.some((re) => re.test(u));
}

export function isV25ImageUrl(url) {
  if (!url) return false;
  return RASTER_OK_PATTERNS.some((re) => re.test(String(url)));
}
