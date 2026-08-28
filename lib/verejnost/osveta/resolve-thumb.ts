import {
  isBrokenCoverUrl,
  isStaleGenericStockUrl,
  pickCuratedCover,
} from "@/lib/ecosystem/editorial/images/cover";
import { getPublicAvatar } from "@/lib/verejnost/osveta/avatars";
import type { PublicHealthCategory } from "@/types/public-osveta";

const CATEGORY_COVER: Record<PublicHealthCategory, string> = {
  prevence: "/assets/covers/research.webp",
  nemoc: "/assets/covers/clinical.webp",
  dlouhovekost: "/assets/covers/seniors.webp",
  "zivotni-styl": "/assets/covers/movement.webp",
};

/** Map osvěta category → curated cover pool key for stable per-slug variety. */
const CATEGORY_VISUAL: Record<PublicHealthCategory, "research" | "clinical" | "seniors" | "movement"> = {
  prevence: "research",
  nemoc: "clinical",
  dlouhovekost: "seniors",
  "zivotni-styl": "movement",
};

function shouldReplaceThumb(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  if (/\.svg(\?|$)/i.test(url)) return true;
  if (isBrokenCoverUrl(url) || isStaleGenericStockUrl(url)) return true;
  if (/images\.unsplash\.com/i.test(url)) return true;
  if (/unsplash\.com/i.test(url)) return true;
  return false;
}

/**
 * Resolve osvěta card / player cover — never show v25 doctor-phone, SVG, or Unsplash leftovers.
 * Falls back to avatar art, then category-matched `/assets/covers/*`.
 */
export function resolveOsvetaThumb(input: {
  thumbnailUrl?: string | null;
  avatarType: string;
  category?: PublicHealthCategory | null;
  slug?: string;
}): string {
  const avatar = getPublicAvatar(input.avatarType);
  const raw = input.thumbnailUrl?.trim();

  if (raw && !shouldReplaceThumb(raw)) {
    return raw;
  }

  const category = input.category;
  if (category && input.slug) {
    return pickCuratedCover(CATEGORY_VISUAL[category], input.slug);
  }
  if (category) {
    return CATEGORY_COVER[category];
  }

  return avatar.imageUrl;
}
