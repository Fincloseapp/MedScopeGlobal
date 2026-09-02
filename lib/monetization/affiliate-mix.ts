/**
 * Marketing mix for ViaLongeVita affiliate boxes.
 * Topic match first, then a rotating high-EPC filler — never dump the catalogue.
 */

import { AFFILIATE_PRODUCTS, type AffiliateProduct } from "@/lib/ecosystem/monetization";
import { isLongevityArticle } from "@/lib/v271/news-desks";

export type MixArticle = {
  title?: string | null;
  excerpt?: string | null;
  slug?: string | null;
  public_topic?: string | null;
  category?: string | null;
};

export type AffiliateSurface = "article" | "articleMid" | "homepage" | "listing" | "newsletter";

export const AFFILIATE_SLOT_COUNTS: Record<AffiliateSurface, number> = {
  article: 4,
  articleMid: 2,
  homepage: 6,
  listing: 4,
  newsletter: 3,
};

/** Relative EPC / AOV heuristic — wearables and devices first, then staples, then volume add-ons. */
export const PRODUCT_WEIGHT: Record<string, number> = {
  "sleep-tracker": 10,
  "blood-pressure-monitor": 8,
  "vitamin-d3-k2": 7,
  "magnesium-glycinate": 7,
  "creatine-monohydrate": 7,
  "omega-3-test": 6,
  "collagen-peptides": 6,
  "electrolyte-powder": 5,
  "resistance-bands": 4,
  "sleep-mask": 4,
  "protein-powder": 6,
  probiotic: 5,
  zinc: 5,
  "foam-roller": 4,
  "yoga-mat": 4,
  "glass-water-bottle": 3,
  "blue-light-glasses": 6,
  "weighted-blanket": 6,
  coq10: 6,
  "grip-strengthener": 5,
  "sunrise-alarm": 7,
  "walking-pad": 9,
  "tart-cherry": 5,
  "kitchen-scale": 4,
};

const CATEGORY_OF: Record<string, AffiliateProduct["category"]> = Object.fromEntries(
  AFFILIATE_PRODUCTS.map((product) => [product.id, product.category])
);

function haystack(article?: MixArticle | null, topic?: string | null): string {
  return [
    article?.title,
    article?.excerpt,
    article?.slug,
    article?.public_topic,
    article?.category,
    topic,
  ]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");
}

export function topicMatchedProductIds(article?: MixArticle | null, topic?: string | null): string[] {
  const text = haystack(article, topic);
  const ids: string[] = [];
  const push = (id: string) => {
    if (!ids.includes(id)) ids.push(id);
  };

  if (/spán|spanek|sleep|insomni|nespav|hrv|oura|whoop|circadian|sommeil|schlaf|sueñ|sonno|seno\b|sen i |alvás/.test(text)) {
    push("sleep-tracker");
    push("sleep-mask");
    push("magnesium-glycinate");
    push("weighted-blanket");
    push("blue-light-glasses");
    push("sunrise-alarm");
    push("tart-cherry");
  }
  if (/magnes|hořčí|horcik|horčík|glycinát|glycinat|magnésium|magnez/.test(text)) {
    push("magnesium-glycinate");
  }
  if (/omega|rybí tuk|rybi tuk|lipid|cholesterol|epa|dha|cœur|cuore/.test(text)) {
    push("omega-3-test");
  }
  if (/vitamin d|vitamín d|vitamine d|witamina d|d3\b|k2\b|kostí|kosti|imunit|osteopor/.test(text)) {
    push("vitamin-d3-k2");
  }
  if (/kreatin|creatine|sarkopen|sval|muscle|strength|silov/.test(text)) {
    push("creatine-monohydrate");
    push("resistance-bands");
  }
  if (/kolagen|collagen|kůže|kuze|kloub|skin|joint|wrinkle|vrásk/.test(text)) {
    push("collagen-peptides");
  }
  if (/elektrolyt|electrolyte|hydrat|pot\b|sportovní nápoj|heat|hork/.test(text)) {
    push("electrolyte-powder");
  }
  if (/tlak|blood pressure|hyperten|blutdruck|tensión|ciśnien/.test(text)) {
    push("blood-pressure-monitor");
  }
  if (/srdc|heart|herz|cœur|cuore|serce/.test(text)) {
    push("omega-3-test");
    push("blood-pressure-monitor");
    push("coq10");
  }
  if (/pohyb|exercise|fitness|workout|posilov|resistance|jóga|joga|yoga|úchop|grip|sarkopen/.test(text)) {
    push("resistance-bands");
    push("creatine-monohydrate");
    push("yoga-mat");
    push("foam-roller");
    push("grip-strengthener");
    push("walking-pad");
  }
  if (/protein|bílkovin|bilkovin|svalov|regener|výživ|vyziv|nutrition|strav/.test(text)) {
    push("protein-powder");
    push("creatine-monohydrate");
    push("kitchen-scale");
  }
  if (/střev|strev|gut|mikrobiom|probiot|digest/.test(text)) {
    push("probiotic");
  }
  if (/\bzinek\b|\bzinc\b|imunit/.test(text)) {
    push("zinc");
    push("vitamin-d3-k2");
  }
  if (/hydrat|voda|water|lahev|flasche|bouteille/.test(text)) {
    push("glass-water-bottle");
    push("electrolyte-powder");
  }
  if (/obrazov|screen|modré světlo|blue light|brille|lunette/.test(text)) {
    push("blue-light-glasses");
  }
  if (/přikrýv|deka|blanket|ťažk|weighted/.test(text)) {
    push("weighted-blanket");
  }
  if (/coq10|koenzym|ubiquinol|ubiquinon/.test(text)) {
    push("coq10");
  }
  if (/chůz|chuze|walk|krok|sedav|desk|kancelář/.test(text)) {
    push("walking-pad");
  }
  if (/budík|budik|alarm|cirkadi|circadian|ráno|světelný bud/.test(text)) {
    push("sunrise-alarm");
  }
  if (/višn|visn|cherry|melatonin/.test(text)) {
    push("tart-cherry");
  }
  if (
    article &&
    isLongevityArticle({
      title: article.title,
      excerpt: article.excerpt,
      slug: article.slug,
      public_topic: article.public_topic,
    })
  ) {
    push("magnesium-glycinate");
    push("vitamin-d3-k2");
    push("omega-3-test");
  }
  if (/dlouhověk|longevity|langleb|longévité|langleb/.test(text)) {
    push("vitamin-d3-k2");
    push("creatine-monohydrate");
    push("omega-3-test");
  }

  return ids;
}

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** 12-hour bucket so the mix refreshes twice a day without flickering every request. */
export function affiliateMixBucket(now = Date.now()): number {
  return Math.floor(now / (12 * 60 * 60 * 1000));
}

function scoreId(id: string, seed: number, index: number): number {
  const weight = PRODUCT_WEIGHT[id] ?? 3;
  return weight * 10 + ((seed + index * 17) % 9);
}

function fillDiverse(preferred: string[], pool: string[], take: number, seed: number): string[] {
  const seen = new Set<string>();
  const categories = new Set<string>();
  const out: string[] = [];

  const consider = (id: string) => {
    if (seen.has(id) || out.length >= take) return;
    const category = CATEGORY_OF[id];
    if (category && categories.has(category) && out.length >= 2 && pool.length > take) {
      return;
    }
    seen.add(id);
    if (category) categories.add(category);
    out.push(id);
  };

  preferred.forEach(consider);

  const ranked = [...pool]
    .map((id, index) => ({ id, score: scoreId(id, seed, index) }))
    .sort((a, b) => b.score - a.score);
  for (const row of ranked) consider(row.id);
  for (const row of ranked) {
    if (out.length >= take) break;
    if (!seen.has(row.id)) {
      seen.add(row.id);
      out.push(row.id);
    }
  }
  return out.slice(0, take);
}

export function pickAffiliateProductIds(opts: {
  surface: AffiliateSurface;
  article?: MixArticle | null;
  topic?: string | null;
  locale?: string | null;
  now?: number;
}): string[] {
  const take = AFFILIATE_SLOT_COUNTS[opts.surface];
  const matched = topicMatchedProductIds(opts.article, opts.topic);
  const seed = hashSeed(
    `${affiliateMixBucket(opts.now)}:${opts.surface}:${opts.locale ?? ""}:${opts.article?.slug ?? opts.topic ?? "home"}`
  );
  const pool = AFFILIATE_PRODUCTS.map((product) => product.id);
  return fillDiverse(matched, pool, take, seed);
}

export function pickAffiliateProducts(opts: {
  surface: AffiliateSurface;
  article?: MixArticle | null;
  topic?: string | null;
  locale?: string | null;
  now?: number;
}): AffiliateProduct[] {
  const ids = pickAffiliateProductIds(opts);
  const order = new Map(ids.map((id, index) => [id, index]));
  return AFFILIATE_PRODUCTS.filter((product) => order.has(product.id)).sort(
    (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
  );
}
