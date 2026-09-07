/** Advertising teasers — not odborná Osvěta lessons. Files are real MP4s for human social upload. */

export type PromoTeaserId = "healthspan" | "sleep" | "lifestyle";

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
    id: "healthspan",
    slug: "healthspan",
    durationSeconds: 8,
    aspect: "9:16",
    videoSrc: "/assets/ads/teasers/healthspan.mp4",
    posterSrc: "/assets/ads/teasers/healthspan.jpg",
    brand: "ViaLongeVita",
    site: "medscopeglobal.com",
    topic: "healthspan",
    line: "Healthspan",
    sub: "Longevity · Dlouhověkost",
    shareTitle: "ViaLongeVita — healthspan · medscopeglobal.com",
  },
  {
    id: "sleep",
    slug: "sleep",
    durationSeconds: 8,
    aspect: "9:16",
    videoSrc: "/assets/ads/teasers/sleep.mp4",
    posterSrc: "/assets/ads/teasers/sleep.jpg",
    brand: "ViaLongeVita",
    site: "medscopeglobal.com",
    topic: "sleep",
    line: "Healthy sleep",
    sub: "Rest · Zdravý spánek",
    shareTitle: "ViaLongeVita — healthy sleep · medscopeglobal.com",
  },
  {
    id: "lifestyle",
    slug: "lifestyle",
    durationSeconds: 8,
    aspect: "9:16",
    videoSrc: "/assets/ads/teasers/lifestyle.mp4",
    posterSrc: "/assets/ads/teasers/lifestyle.jpg",
    brand: "ViaLongeVita",
    site: "medscopeglobal.com",
    topic: "lifestyle",
    line: "Healthy living",
    sub: "Food · Movement · Style",
    shareTitle: "ViaLongeVita — healthy living · medscopeglobal.com",
  },
];

export function getPromoTeasers(): PromoTeaser[] {
  return PROMO_TEASERS;
}

export function getPromoTeaser(id: string): PromoTeaser | null {
  return PROMO_TEASERS.find((row) => row.id === id || row.slug === id) ?? null;
}
