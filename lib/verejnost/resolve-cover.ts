import { hasBadUnsplashId } from "@/lib/v25/images/bad-unsplash-ids";
import { resolveWriterAgent } from "@/lib/editorial/writer-agents";

const U = (id: string) =>
  `https://images.unsplash.com/${id}?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp`;

/**
 * Diplomatic, topic-tied stock — equipment, food, sleep, nature, clinic.
 * No portraits, no cadavers, no brain-on-a-stick anatomy props.
 */
const PHOTO = {
  hands: U("photo-1584515930387-285e4804f4cb"),
  clinic: U("photo-1576091160399-112ba8d25d1d"),
  pills: U("photo-1584308664744-24d5c474f2ae"),
  laptop: U("photo-1573164713714-d95e436ab8d6"),
  campus: U("photo-1523050854058-8df90110c9f1"),
  mic: U("photo-1478737270239-2f02e77f67c9"),
  food: U("photo-1490645935967-10de6ba17061"),
  salad: U("photo-1512621776951-a57141f2eefd"),
  kitchen: U("photo-1498837167922-ddd27525ae35"),
  water: U("photo-1548839140-29a749e1cf4d"),
  sleep: U("photo-1631049307264-da0ec9d70304"),
  forest: U("photo-1441974231531-c6227db76b6e"),
  weights: U("photo-1517836357463-d25dfeac3438"),
  shoes: U("photo-1542291026-7eec264c27ff"),
  books: U("photo-1481627834876-b7833e8f5570"),
  desk: U("photo-1434030216411-0b793f4b4173"),
  lecture: U("photo-1606761568499-6d2451b23be8"),
  congress: U("photo-1540575467063-178a50c2df87"),
  law: U("photo-1589829545855-d10d557cf95f"),
} as const;

const ALLOWED_IDS = Object.values(PHOTO).map((url) => url.match(/photo-[a-z0-9]+/i)?.[0] ?? "");

const KEYWORD_PHOTOS: { keys: RegExp; url: string }[] = [
  { keys: /spánk|spanek|insomn|regenerac|postel|unaven/i, url: PHOTO.sleep },
  { keys: /hydrat|pitn[ée]|vod[ae]|tekutin/i, url: PHOTO.water },
  { keys: /výživ|vyziv|jíd|jidlo|talíř|talir|bílkovin|bilkovin|strav|diet|zelenin|snídan/i, url: PHOTO.food },
  { keys: /středomoř|stredomor|salát|salat|oliv/i, url: PHOTO.salad },
  { keys: /kuchyň|kuchyn|vařen|varen/i, url: PHOTO.kitchen },
  { keys: /stres|dechov|imunit|odolnost|klid|pohod/i, url: PHOTO.forest },
  { keys: /pohyb|cvič|cvic|fitness|posilov|chůz|chuz|běh|beh|10 minut/i, url: PHOTO.weights },
  { keys: /bot[ay]|běžeck|bezeck/i, url: PHOTO.shoes },
  { keys: /lék[yu]|lek[yu]|pilulk|farmak|tabletk/i, url: PHOTO.pills },
  { keys: /rozhovor|podcast|mikrofon|interview|host/i, url: PHOTO.mic },
  { keys: /univerzit|fakult|přednáš|prednask|kampus|student/i, url: PHOTO.campus },
  { keys: /studium|učen|ucen|zkoušk|zkousk|skript/i, url: PHOTO.desk },
  { keys: /knih|čtení|cteni/i, url: PHOTO.books },
  { keys: /kongres|konferen/i, url: PHOTO.congress },
  { keys: /zákon|zakon|legislativ|právo|pravo/i, url: PHOTO.law },
  { keys: /digitál|digital|aplikac|počítač|pocitac|notebook/i, url: PHOTO.laptop },
  { keys: /prevenc|screening|očkov|ockov|prohlíd|prohlid/i, url: PHOTO.clinic },
  { keys: /nemoc|diagnóz|diagnos|symptom|příznak|priznak/i, url: PHOTO.hands },
];

const TOPIC_PHOTOS: Record<string, string[]> = {
  "zivotni-styl": [PHOTO.food, PHOTO.sleep, PHOTO.forest, PHOTO.water, PHOTO.weights, PHOTO.salad],
  nemoci: [PHOTO.hands, PHOTO.clinic, PHOTO.pills],
  prevence: [PHOTO.clinic, PHOTO.hands, PHOTO.weights, PHOTO.food],
  rozhovory: [PHOTO.mic, PHOTO.lecture, PHOTO.campus],
  dlouhovekost: [PHOTO.forest, PHOTO.food, PHOTO.sleep, PHOTO.weights],
};

function sigForSlug(slug: string): string {
  const n = Math.abs(slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 999);
  return `&sig=${n}`;
}

function isAllowedUnsplash(url: string): boolean {
  if (hasBadUnsplashId(url)) return false;
  return ALLOWED_IDS.some((id) => id && url.includes(id));
}

function isUnsafeCover(url: string): boolean {
  if (hasBadUnsplashId(url)) return true;
  if (/\.svg(\?|$)/i.test(url)) return true;
  if (/\/api\/v25\/images\/render/i.test(url)) return true;
  if (/Neutral\s*·\s*European/i.test(url)) return true;
  if (/photo-1559757148|photo-1559757175|brain|cadaver|skull/i.test(url)) return true;
  return false;
}

function isProductionCover(url: string): boolean {
  if (isUnsafeCover(url)) return false;
  if (/supabase\.co\/storage\/v1\/object\/public\/media\/v25-images\/.*\.(jpg|jpeg|png|webp)(\?|$)/i.test(url)) {
    return true;
  }
  if (/unsplash\.com/i.test(url)) return isAllowedUnsplash(url);
  return false;
}

function pickFromPool(slug: string, pool: string[]): string {
  const n = Math.abs(slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  return pool[n % pool.length] ?? PHOTO.clinic;
}

export function resolveVerejnostCoverUrl(article: {
  slug: string;
  title?: string | null;
  excerpt?: string | null;
  cover_image_url?: string | null;
  public_topic?: string | null;
  metadata?: Record<string, unknown> | null;
}): string {
  const blob = `${article.title ?? ""} ${article.excerpt ?? ""} ${article.slug}`;
  const keyword = KEYWORD_PHOTOS.find((row) => row.keys.test(blob));
  if (keyword) return `${keyword.url}${sigForSlug(article.slug)}`;

  const stored = article.cover_image_url?.trim();
  if (stored && isProductionCover(stored)) return stored;

  const agent = resolveWriterAgent(article);
  const topic = (article.public_topic || agent?.topic || "zivotni-styl").toLowerCase();
  const pool = TOPIC_PHOTOS[topic] ?? TOPIC_PHOTOS["zivotni-styl"]!;
  return `${pickFromPool(article.slug, pool)}${sigForSlug(article.slug)}`;
}
