/** Advertising teasers — not odborná Osvěta lessons. Files are real MP4s for human social upload. */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";

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

type TeaserLines = Pick<PromoTeaser, "line" | "sub" | "shareTitle">;

const LINES: Record<ChromePack, Record<PromoTeaserId, TeaserLines>> = {
  cs: {
    man: { line: "Čte. Zůstává.", sub: "Dlouhověkost", shareTitle: "ViaLongeVita — čte · medscopeglobal.com" },
    woman: { line: "Čte. Zůstává.", sub: "Dlouhověkost", shareTitle: "ViaLongeVita — čte · medscopeglobal.com" },
    alike: { line: "Stejná tvář. Jiná léta.", sub: "Mladý žije. Starší čte.", shareTitle: "ViaLongeVita — stejná tvář · medscopeglobal.com" },
  },
  de: {
    man: { line: "Er liest. Er bleibt.", sub: "Langlebigkeit", shareTitle: "ViaLongeVita — er liest · medscopeglobal.com" },
    woman: { line: "Sie liest. Sie bleibt.", sub: "Langlebigkeit", shareTitle: "ViaLongeVita — sie liest · medscopeglobal.com" },
    alike: { line: "Dasselbe Gesicht. Andere Jahre.", sub: "Jung lebt. Älter liest.", shareTitle: "ViaLongeVita — dasselbe Gesicht · medscopeglobal.com" },
  },
  fr: {
    man: { line: "Il lit. Il reste.", sub: "Longévité", shareTitle: "ViaLongeVita — il lit · medscopeglobal.com" },
    woman: { line: "Elle lit. Elle reste.", sub: "Longévité", shareTitle: "ViaLongeVita — elle lit · medscopeglobal.com" },
    alike: { line: "Même visage. Autres années.", sub: "Le jeune vit. L’aîné lit.", shareTitle: "ViaLongeVita — même visage · medscopeglobal.com" },
  },
  en: {
    man: { line: "He reads. He stays.", sub: "Longevity", shareTitle: "ViaLongeVita — he reads · medscopeglobal.com" },
    woman: { line: "She reads. She stays.", sub: "Longevity", shareTitle: "ViaLongeVita — she reads · medscopeglobal.com" },
    alike: { line: "Same face. Different years.", sub: "Young lives. Older reads.", shareTitle: "ViaLongeVita — same face · medscopeglobal.com" },
  },
  it: {
    man: { line: "Lui legge. Lui resta.", sub: "Longevità", shareTitle: "ViaLongeVita — lui legge · medscopeglobal.com" },
    woman: { line: "Lei legge. Lei resta.", sub: "Longevità", shareTitle: "ViaLongeVita — lei legge · medscopeglobal.com" },
    alike: { line: "Lo stesso viso. Altri anni.", sub: "Il giovane vive. L’anziano legge.", shareTitle: "ViaLongeVita — stesso viso · medscopeglobal.com" },
  },
  es: {
    man: { line: "Él lee. Él se queda.", sub: "Longevidad", shareTitle: "ViaLongeVita — él lee · medscopeglobal.com" },
    woman: { line: "Ella lee. Ella se queda.", sub: "Longevidad", shareTitle: "ViaLongeVita — ella lee · medscopeglobal.com" },
    alike: { line: "La misma cara. Otros años.", sub: "El joven vive. El mayor lee.", shareTitle: "ViaLongeVita — misma cara · medscopeglobal.com" },
  },
  "pt-BR": {
    man: { line: "Ele lê. Ele fica.", sub: "Longevidade", shareTitle: "ViaLongeVita — ele lê · medscopeglobal.com" },
    woman: { line: "Ela lê. Ela fica.", sub: "Longevidade", shareTitle: "ViaLongeVita — ela lê · medscopeglobal.com" },
    alike: { line: "O mesmo rosto. Outros anos.", sub: "O jovem vive. O mais velho lê.", shareTitle: "ViaLongeVita — mesmo rosto · medscopeglobal.com" },
  },
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
    ...LINES.en.man,
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
    ...LINES.en.woman,
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
    ...LINES.en.alike,
  },
];

export function getPromoTeasers(locale?: string | null): PromoTeaser[] {
  const pack = locale == null ? "en" : chromePack(locale);
  return PROMO_TEASERS.map((row) => ({ ...row, ...LINES[pack][row.id] }));
}

export function getPromoTeaser(id: string, locale?: string | null): PromoTeaser | null {
  const row = PROMO_TEASERS.find((item) => item.id === id || item.slug === id);
  if (!row) return null;
  const pack = locale == null ? "en" : chromePack(locale);
  return { ...row, ...LINES[pack][row.id] };
}
