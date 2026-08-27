/**
 * Public-health topic stills for hub tiles — local curated covers only.
 * Do not point at Unsplash / v25 doctor-phone stock (listings rewrite via
 * resolveArticleCoverUrl; hub tiles must match).
 */

const TOPIC_IMAGES: Record<string, string> = {
  "pruvodce-nemocemi": "/assets/covers/clinical.webp",
  symptomy: "/assets/covers/clinical-2.webp",
  prevence: "/assets/covers/research.webp",
  "zivotni-styl": "/assets/covers/movement.webp",
  vyziva: "/assets/covers/food.webp",
  spanek: "/assets/covers/sleep.webp",
  stres: "/assets/covers/calm.webp",
  ergonomie: "/assets/covers/walk.webp",
  rozhovory: "/assets/covers/clinical-3.webp",
  "zivotni-styl-backend": "/assets/covers/movement.webp",
  nemoci: "/assets/covers/clinical.webp",
  "prevence-backend": "/assets/covers/research.webp",
  "rozhovory-backend": "/assets/covers/clinical-3.webp",
  dlouhovekost: "/assets/covers/seniors.webp",
};

export function getPublicTopicImage(slug: string): string | null {
  return TOPIC_IMAGES[slug] ?? null;
}

/** Seed / demo fallback when no article-specific cover is set. */
export const VEREJNOST_FALLBACK_COVER = "/assets/covers/clinical.webp";
