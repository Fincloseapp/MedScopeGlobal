/**
 * Resolve article hero/cover URLs for reading UX + listings.
 *
 * Production v25-images stock is heavily duplicated (same doctor-phone bytes
 * reused across Mediterranean diet, menopause, sleep, prevention…). Replace
 * broken / placeholder / mismatched clinical stock with topic-matched local
 * curated covers under /assets/covers/.
 */

export type CoverVisualTopic =
  | "food"
  | "sleep"
  | "calm"
  | "movement"
  | "seniors"
  | "clinical"
  | "research"
  | "tech"
  | "vitals"
  | "walk";

const COVER_POOL: Record<CoverVisualTopic, readonly string[]> = {
  food: [
    "/assets/covers/food.webp",
    "/assets/covers/food-2.webp",
    "/assets/covers/food-3.webp",
    "/assets/covers/food-4.webp",
    "/assets/covers/produce.webp",
  ],
  sleep: ["/assets/covers/sleep.webp", "/assets/covers/calm-2.webp"],
  calm: ["/assets/covers/calm.webp", "/assets/covers/calm-2.webp"],
  movement: ["/assets/covers/movement.webp", "/assets/covers/movement-2.webp"],
  seniors: ["/assets/covers/seniors.webp", "/assets/covers/walk.webp"],
  clinical: [
    "/assets/covers/clinical.webp",
    "/assets/covers/clinical-2.webp",
    "/assets/covers/clinical-3.webp",
  ],
  research: [
    "/assets/covers/research.webp",
    "/assets/covers/research-2.webp",
    "/assets/covers/science.webp",
  ],
  tech: ["/assets/covers/tech.webp", "/assets/covers/vitals.webp"],
  vitals: ["/assets/covers/vitals.webp", "/assets/covers/clinical.webp"],
  walk: ["/assets/covers/walk.webp", "/assets/covers/movement.webp"],
};

/** Dead / blocked remote IDs that 404 or are known-bad stock. */
const DEAD_OR_BAD_REMOTE = [
  "photo-1584515930387-285e4804f4cb",
  "photo-1523050854058-8df90110c9f1",
  "photo-1581579438749-86c8e8f9f9d0",
  "photo-1576765608535-5e04c5a8f0c0",
  "photo-1559757175-5700cde872bc",
  "photo-1584308664744-24d5c474f2ae",
  "photo-1478737270239-2f02e77f67c9",
  "photo-1576091160550-2173dba999ef", // listed bad-unsplash
  "photo-1579684385127-1ef15d508118",
] as const;

const FOOD_RE =
  /tal[ií][rř]|st[rř]edo\s*mo[rř]|stredomorsk|kuchyn|strav|j[ií]dl|meal|diet|v[yý][zž]iv|sal[aá]t|olive|zelenin|protein|b[ií]lkovin|hydrat|pitn[eé]|ovoce|sn[ií]dan|ve[cč]e[rř]|potravin/i;

const SLEEP_RE =
  /sp[aá]nek|sleep|apnoe|insomni|odpo[cč]ink|no[cč]n[ií]|polar|postel|unava|únava|jarn[ií]\s+unava|zimn[ií]\s+unava/i;

const CALM_RE =
  /stres|stress|mindful|meditac|dechov|relax|pohoda|imunit.*pr[aá]ce|wellness|klid/i;

const MOVEMENT_RE =
  /pohyb|cvi[cč]|fitness|sport|ch[uů]ze|walk|cvik|trenink|tr[eé]nink|s[ií]la|sval/i;

const SENIORS_RE =
  /senior|st[aá][rř]nut|aging|menopauz|kost[ií]|osteopor|hrt|d[uů]chod/i;

const KIDS_RE = /d[eě]t[ií]|[sš]kol|imunit.*d[eě]t|pediatr/i;

const RESEARCH_RE =
  /biomarker|studie|v[yý]zkum|research|guidelines|delphi|konsensus|screening|prevence|rakovin|kardiovaskul/i;

const CLINICAL_RE =
  /cukrovka|diabet|nemoc|chorob|diagn[oó]|l[eé][cč]b|klinick|hospital|ordinac|l[eé]ka[rř]/i;

const TECH_RE =
  /telemedic|digit[aá]ln|aplikac|technologie|ai\b|wearable|monitor/i;

const VITALS_RE =
  /gluk[oó]z|lipid|vitamin|krevn[ií]|tlak|hrv|srdc|cholesterol/i;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function haystack(input: {
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  category?: string | null;
  publicTopic?: string | null;
}): string {
  return [
    input.title,
    input.slug,
    input.excerpt,
    input.category,
    input.publicTopic,
  ]
    .filter(Boolean)
    .join(" ");
}

export function classifyCoverTopic(input: {
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  category?: string | null;
  publicTopic?: string | null;
}): CoverVisualTopic {
  const hay = haystack(input);
  const topic = (input.publicTopic ?? "").toLowerCase();

  if (FOOD_RE.test(hay) || topic.includes("zivotni") || topic.includes("strav")) {
    if (FOOD_RE.test(hay)) return "food";
  }
  if (SLEEP_RE.test(hay)) return "sleep";
  if (CALM_RE.test(hay)) return "calm";
  if (MOVEMENT_RE.test(hay)) return "movement";
  if (SENIORS_RE.test(hay)) return "seniors";
  if (KIDS_RE.test(hay)) return "walk";
  if (VITALS_RE.test(hay)) return "vitals";
  if (TECH_RE.test(hay)) return "tech";
  if (RESEARCH_RE.test(hay) || topic.includes("prevence")) return "research";
  if (CLINICAL_RE.test(hay) || topic.includes("nemoci")) return "clinical";
  if (topic.includes("zivotni")) return "calm";
  if (topic.includes("rozhovor")) return "clinical";
  return "research";
}

export function pickCuratedCover(
  topic: CoverVisualTopic,
  seed: string
): string {
  const pool = COVER_POOL[topic] ?? COVER_POOL.research;
  return pool[hashString(seed) % pool.length]!;
}

export function isBrokenCoverUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  const lower = url.toLowerCase();
  if (
    lower.includes("placeholder") ||
    lower.includes("via.placeholder") ||
    lower.includes("placehold.co") ||
    lower.includes("checkerboard") ||
    lower.includes("picsum.photos") ||
    lower.includes("dummyimage") ||
    lower.includes("/api/v25/images/render") ||
    (lower.includes("neutral") && lower.includes("european"))
  ) {
    return true;
  }
  if (/\.svg(\?|$)/i.test(lower)) return true;
  if (/\/assets\/affiliate\//i.test(lower)) return true;
  if (DEAD_OR_BAD_REMOTE.some((id) => lower.includes(id))) return true;
  return false;
}

/** Overused / generic clinical AI stock from the v25 pipeline. */
export function isStaleGenericStockUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const lower = url.toLowerCase();
  if (/\/v25-images\//i.test(lower) || /\/media\/v25-images\//i.test(lower)) {
    return true;
  }
  // Source Unsplash leftovers that often mismatch lifestyle copy
  if (/images\.unsplash\.com/i.test(lower) && !lower.includes("/assets/covers/")) {
    // Keep only if we already rewrote to local; remote unsplash on articles is legacy
    return true;
  }
  return false;
}

/**
 * Prefer topic-matched curated local art when the stored cover is broken,
 * SVG/placeholder, or overused v25 / Unsplash stock.
 * Returns null only when we intentionally want the branded gradient fallback.
 */
export function resolveArticleCoverUrl(input: {
  title: string;
  slug?: string;
  excerpt?: string | null;
  category?: string | null;
  publicTopic?: string | null;
  coverImageUrl?: string | null;
  /** When true, never return null — always a curated asset. */
  preferCurated?: boolean;
}): string | null {
  const raw = input.coverImageUrl?.trim() || null;
  const topic = classifyCoverTopic(input);
  const seed = input.slug || input.title;
  const curated = pickCuratedCover(topic, seed);

  if (isBrokenCoverUrl(raw)) {
    return input.preferCurated === false ? null : curated;
  }

  // Keep first-party local covers (marketing / covers / newsletter)
  if (
    raw &&
    (/^\/assets\/covers\//i.test(raw) ||
      /^\/assets\/newsletter\//i.test(raw) ||
      /^\/assets\/marketing\//i.test(raw))
  ) {
    return raw;
  }

  if (raw && isStaleGenericStockUrl(raw)) {
    return curated;
  }

  // Unknown remote — keep if it looks like a real raster URL
  if (raw && /\.(webp|jpe?g|png)(\?|$)/i.test(raw)) {
    return raw;
  }

  return input.preferCurated === false ? null : curated;
}
