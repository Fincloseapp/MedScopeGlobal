/** Advertising teasers — not odborná Osvěta lessons. Files are real MP4s for human social upload. */

import { chromePack, type ChromePack } from "@/lib/i18n/chrome-pack";
import { normalizeLocale } from "@/lib/i18n/config";

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

const EXTRA_LINES: Record<string, Record<PromoTeaserId, TeaserLines>> = {
  sk: {
    man: { line: "Číta. Ostáva.", sub: "Dlhovekosť", shareTitle: "ViaLongeVita — číta · medscopeglobal.com" },
    woman: { line: "Číta. Ostáva.", sub: "Dlhovekosť", shareTitle: "ViaLongeVita — číta · medscopeglobal.com" },
    alike: { line: "Rovnaká tvár. Iné roky.", sub: "Mladý žije. Starší číta.", shareTitle: "ViaLongeVita — rovnaká tvár · medscopeglobal.com" },
  },
  pl: {
    man: { line: "Czyta. Zostaje.", sub: "Długowieczność", shareTitle: "ViaLongeVita — czyta · medscopeglobal.com" },
    woman: { line: "Czyta. Zostaje.", sub: "Długowieczność", shareTitle: "ViaLongeVita — czyta · medscopeglobal.com" },
    alike: { line: "Ta sama twarz. Inne lata.", sub: "Młody żyje. Starszy czyta.", shareTitle: "ViaLongeVita — ta sama twarz · medscopeglobal.com" },
  },
  ro: {
    man: { line: "Citește. Rămâne.", sub: "Longevitate", shareTitle: "ViaLongeVita — citește · medscopeglobal.com" },
    woman: { line: "Citește. Rămâne.", sub: "Longevitate", shareTitle: "ViaLongeVita — citește · medscopeglobal.com" },
    alike: { line: "Același chip. Alți ani.", sub: "Tânărul trăiește. Bătrânul citește.", shareTitle: "ViaLongeVita — același chip · medscopeglobal.com" },
  },
  hu: {
    man: { line: "Olvas. Marad.", sub: "Hosszú élet", shareTitle: "ViaLongeVita — olvas · medscopeglobal.com" },
    woman: { line: "Olvas. Marad.", sub: "Hosszú élet", shareTitle: "ViaLongeVita — olvas · medscopeglobal.com" },
    alike: { line: "Ugyanaz az arc. Más évek.", sub: "A fiatal él. Az idősebb olvas.", shareTitle: "ViaLongeVita — ugyanaz az arc · medscopeglobal.com" },
  },
  ru: {
    man: { line: "Читает. Остаётся.", sub: "Долголетие", shareTitle: "ViaLongeVita — читает · medscopeglobal.com" },
    woman: { line: "Читает. Остаётся.", sub: "Долголетие", shareTitle: "ViaLongeVita — читает · medscopeglobal.com" },
    alike: { line: "То же лицо. Другие годы.", sub: "Молодой живёт. Старший читает.", shareTitle: "ViaLongeVita — то же лицо · medscopeglobal.com" },
  },
  uk: {
    man: { line: "Читає. Залишається.", sub: "Довголіття", shareTitle: "ViaLongeVita — читає · medscopeglobal.com" },
    woman: { line: "Читає. Залишається.", sub: "Довголіття", shareTitle: "ViaLongeVita — читає · medscopeglobal.com" },
    alike: { line: "Те саме обличчя. Інші роки.", sub: "Молодий живе. Старший читає.", shareTitle: "ViaLongeVita — те саме обличчя · medscopeglobal.com" },
  },
  be: {
    man: { line: "Чытае. Застаецца.", sub: "Доўгалецце", shareTitle: "ViaLongeVita — чытае · medscopeglobal.com" },
    woman: { line: "Чытае. Застаецца.", sub: "Доўгалецце", shareTitle: "ViaLongeVita — чытае · medscopeglobal.com" },
    alike: { line: "Тое самае твар. Іншыя гады.", sub: "Малады жыве. Старэйшы чытае.", shareTitle: "ViaLongeVita — тое самае твар · medscopeglobal.com" },
  },
  ja: {
    man: { line: "読む。残る。", sub: "長寿", shareTitle: "ViaLongeVita — 読む · medscopeglobal.com" },
    woman: { line: "読む。残る。", sub: "長寿", shareTitle: "ViaLongeVita — 読む · medscopeglobal.com" },
    alike: { line: "同じ顔。違う歳。", sub: "若者は生きる。年長者は読む。", shareTitle: "ViaLongeVita — 同じ顔 · medscopeglobal.com" },
  },
  ko: {
    man: { line: "읽는다. 남는다.", sub: "장수", shareTitle: "ViaLongeVita — 읽는다 · medscopeglobal.com" },
    woman: { line: "읽는다. 남는다.", sub: "장수", shareTitle: "ViaLongeVita — 읽는다 · medscopeglobal.com" },
    alike: { line: "같은 얼굴. 다른 나이.", sub: "젊은이는 산다. 나이 든 이는 읽는다.", shareTitle: "ViaLongeVita — 같은 얼굴 · medscopeglobal.com" },
  },
  "zh-CN": {
    man: { line: "他在读。他留下。", sub: "长寿", shareTitle: "ViaLongeVita — 他在读 · medscopeglobal.com" },
    woman: { line: "她在读。她留下。", sub: "长寿", shareTitle: "ViaLongeVita — 她在读 · medscopeglobal.com" },
    alike: { line: "同一张脸。不同的年岁。", sub: "年轻人生活。年长者阅读。", shareTitle: "ViaLongeVita — 同一张脸 · medscopeglobal.com" },
  },
  vi: {
    man: { line: "Anh ấy đọc. Anh ấy ở lại.", sub: "Trường thọ", shareTitle: "ViaLongeVita — đọc · medscopeglobal.com" },
    woman: { line: "Cô ấy đọc. Cô ấy ở lại.", sub: "Trường thọ", shareTitle: "ViaLongeVita — đọc · medscopeglobal.com" },
    alike: { line: "Cùng một khuôn mặt. Năm tháng khác.", sub: "Người trẻ sống. Người lớn tuổi đọc.", shareTitle: "ViaLongeVita — cùng khuôn mặt · medscopeglobal.com" },
  },
  id: {
    man: { line: "Ia membaca. Ia tinggal.", sub: "Umur panjang", shareTitle: "ViaLongeVita — membaca · medscopeglobal.com" },
    woman: { line: "Ia membaca. Ia tinggal.", sub: "Umur panjang", shareTitle: "ViaLongeVita — membaca · medscopeglobal.com" },
    alike: { line: "Wajah yang sama. Tahun yang lain.", sub: "Yang muda hidup. Yang tua membaca.", shareTitle: "ViaLongeVita — wajah yang sama · medscopeglobal.com" },
  },
};

function promoLines(locale?: string | null): Record<PromoTeaserId, TeaserLines> {
  if (locale == null) return LINES.en;
  const raw = normalizeLocale(locale);
  const key = raw === "jp" ? "ja" : raw === "kr" ? "ko" : raw === "cn" ? "zh-CN" : raw;
  return EXTRA_LINES[key] ?? LINES[chromePack(key)];
}

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
  const lines = promoLines(locale);
  return PROMO_TEASERS.map((row) => ({ ...row, ...lines[row.id] }));
}

export function getPromoTeaser(id: string, locale?: string | null): PromoTeaser | null {
  const row = PROMO_TEASERS.find((item) => item.id === id || item.slug === id);
  if (!row) return null;
  return { ...row, ...promoLines(locale)[row.id] };
}
