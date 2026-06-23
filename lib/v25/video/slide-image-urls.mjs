/**
 * Verified Unsplash URLs for batch scripts — keep in sync with slide-images.ts
 */
export const DEFAULT_SLIDE_IMAGE =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=450&fit=crop&q=80&auto=format";

export const BROKEN_UNSPLASH_PHOTO_IDS = [
  "photo-1532187863486-abf9db1a4690",
  "photo-1628348068343-c6a848d2a385",
  "photo-1559757175-5700cde872bc",
  "photo-1532636865606-79b0b8b44644",
  "photo-1628595357799-9c8c8fd22790",
  "photo-1523050854058-8df90110c9f1",
  "photo-1584515930387-285e4804f4cb",
];

export const KEYWORD_IMAGES = {
  anatomy: DEFAULT_SLIDE_IMAGE,
  orientation: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=450&fit=crop&q=80&auto=format",
  skeleton: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=450&fit=crop&q=80&auto=format",
  heart: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=450&fit=crop&q=80&auto=format",
  blood: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=450&fit=crop&q=80&auto=format",
  circulation: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=450&fit=crop&q=80&auto=format",
  pharmacy: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=450&fit=crop&q=80&auto=format",
  cell: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=450&fit=crop&q=80&auto=format",
  biology: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=450&fit=crop&q=80&auto=format",
  chemistry: DEFAULT_SLIDE_IMAGE,
  physics: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop&q=80&auto=format",
  physiology: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=450&fit=crop&q=80&auto=format",
  brain: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=450&fit=crop&q=80&auto=format",
  nutrition: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=450&fit=crop&q=80&auto=format",
  diet: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=450&fit=crop&q=80&auto=format",
  health: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=450&fit=crop&q=80&auto=format",
  exam: DEFAULT_SLIDE_IMAGE,
  muscle: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=450&fit=crop&q=80&auto=format",
  lung: DEFAULT_SLIDE_IMAGE,
  default: DEFAULT_SLIDE_IMAGE,
};

export function isBrokenSlideImageUrl(url) {
  if (!url?.trim()) return true;
  if (!url.startsWith("http")) return true;
  return BROKEN_UNSPLASH_PHOTO_IDS.some((id) => url.includes(id));
}

export async function verifyImageUrl(url) {
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "follow" });
    return r.ok;
  } catch {
    return false;
  }
}

export async function ensureWorkingImageUrl(url, fallback) {
  if (url && !isBrokenSlideImageUrl(url) && (await verifyImageUrl(url))) return url;
  if (fallback && !isBrokenSlideImageUrl(fallback) && (await verifyImageUrl(fallback))) return fallback;
  if (await verifyImageUrl(DEFAULT_SLIDE_IMAGE)) return DEFAULT_SLIDE_IMAGE;
  return fallback ?? DEFAULT_SLIDE_IMAGE;
}
