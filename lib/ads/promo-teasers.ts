/** Advertising teasers — not odborná Osvěta lessons. Files are real MP4s for human social upload. */

export type PromoTeaserId = "man" | "woman" | "alike";

export type PromoTeaser = {
  id: PromoTeaserId;
  slug: string;
  durationSeconds: 8;
  aspect: "9:16";
  videoSrc: string;
  posterSrc: string;
  brand: "ViaLongeVita";
  site: "medscopeglobal.com";
  topic: string;
  line: string;
  sub: string;
  shareTitle: string;
};

export const PROMO_TEASERS: PromoTeaser[] = [
  {
    id: "man",
    slug: "man",
    durationSeconds: 8,
    aspect: "9:16",
    videoSrc: "/assets/ads/teasers/man.mp4",
    posterSrc: "/assets/ads/teasers/man.jpg",
    brand: "ViaLongeVita",
    site: "medscopeglobal.com",
    topic: "longevity",
    line: "He reads. He stays.",
    sub: "Dlouhověkost · Longevity",
    shareTitle: "ViaLongeVita — he reads · medscopeglobal.com",
  },
  {
    id: "woman",
    slug: "woman",
    durationSeconds: 8,
    aspect: "9:16",
    videoSrc: "/assets/ads/teasers/woman.mp4",
    posterSrc: "/assets/ads/teasers/woman.jpg",
    brand: "ViaLongeVita",
    site: "medscopeglobal.com",
    topic: "longevity",
    line: "She reads. She stays.",
    sub: "Dlouhověkost · Longevity",
    shareTitle: "ViaLongeVita — she reads · medscopeglobal.com",
  },
  {
    id: "alike",
    slug: "alike",
    durationSeconds: 8,
    aspect: "9:16",
    videoSrc: "/assets/ads/teasers/alike.mp4",
    posterSrc: "/assets/ads/teasers/alike.jpg",
    brand: "ViaLongeVita",
    site: "medscopeglobal.com",
    topic: "longevity",
    line: "Same face. Different years.",
    sub: "Young lives. Older reads.",
    shareTitle: "ViaLongeVita — same face · medscopeglobal.com",
  },
];

export function getPromoTeasers(): PromoTeaser[] {
  return PROMO_TEASERS;
}

export function getPromoTeaser(id: string): PromoTeaser | null {
  return PROMO_TEASERS.find((row) => row.id === id || row.slug === id) ?? null;
}
