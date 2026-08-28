/**
 * Resolve article hero/cover URLs for reading UX + listings.
 *
 * Production v25-images stock is heavily duplicated (same doctor-phone bytes
 * reused across Mediterranean diet, menopause, sleep, prevention…). Replace
 * broken / placeholder / mismatched clinical stock with topic-matched local
 * curated covers under /assets/covers/.
 *
 * Shared by: article pages, veřejnost listings, editorial image backfill
 * (`matcher.ts`), and the brain-cover-ban compliance layer in `policy.ts`.
 */

import type { EditorialTopic } from "../desks";

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
    "/assets/covers/clinical-2.webp",
    "/assets/covers/clinical-3.webp",
    "/assets/covers/research.webp",
  ],
  research: [
    "/assets/covers/research.webp",
    "/assets/covers/research-2.webp",
    "/assets/covers/science.webp",
  ],
  tech: ["/assets/covers/tech.webp", "/assets/covers/vitals.webp"],
  vitals: ["/assets/covers/vitals.webp", "/assets/covers/clinical-3.webp"],
  walk: ["/assets/covers/walk.webp", "/assets/covers/movement.webp"],
};

/** Curated paths that read as clinical / lab / brain — never pair with food titles. */
export const CLINICAL_COVER_SLUGS = [
  "clinical",
  "clinical-2",
  "clinical-3",
  "vitals",
  "research",
  "research-2",
  "science",
  "tech",
] as const;

/** Keywords used to score cover candidates against article text (editorial matcher). */
export const VISUAL_TOPIC_KEYWORDS: Record<CoverVisualTopic, readonly string[]> = {
  food: [
    "talíř",
    "talir",
    "středomořsk",
    "stredomorsk",
    "strava",
    "výživ",
    "vyziv",
    "jídlo",
    "jidlo",
    "meal",
    "diet",
    "salad",
    "salát",
    "produce",
    "food",
    "kuchyn",
    "olive",
    "zelenin",
    "ovoce",
    "snídan",
    "snidani",
    "potravin",
    "bílkovin",
    "bilkovin",
    "protein",
    "sytost",
    "recept",
    "jídelníček",
    "jidelnicek",
    "výživa",
    "nutrition",
  ],
  sleep: ["spánek", "spanek", "sleep", "odpočinek", "odpocinek", "postel", "unava", "únava"],
  calm: ["stres", "stress", "mindful", "meditac", "relax", "klid", "wellness"],
  movement: ["pohyb", "cvič", "cvic", "fitness", "sport", "chůze", "chuze", "walk", "trenink"],
  seniors: ["senior", "stárnut", "starnut", "aging", "menopauz", "důchod", "duchod"],
  clinical: ["klinick", "nemoc", "chorob", "lékař", "lekar", "hospital", "ordinac", "diagn"],
  research: ["studie", "výzkum", "vyzkum", "research", "biomarker", "guideline", "prevence"],
  tech: ["digitáln", "digital", "aplikac", "telemedic", "wearable", "ai"],
  vitals: ["glukóz", "glukoz", "tlak", "srdce", "cholesterol", "vitamin", "krev"],
  walk: ["chůze", "chuze", "walk", "příroda", "priroda", "outdoor"],
};

export function getCoverPoolForTopic(topic: CoverVisualTopic): readonly string[] {
  return COVER_POOL[topic] ?? COVER_POOL.research;
}

/** Map fine-grained visual topic → editorial desk topic (DB / alt-text metadata). */
export function mapCoverVisualTopicToEditorialTopic(
  visual: CoverVisualTopic
): EditorialTopic {
  switch (visual) {
    case "food":
    case "sleep":
    case "calm":
    case "movement":
    case "walk":
      return "lifestyle";
    case "seniors":
      return "seniors";
    case "clinical":
    case "vitals":
    case "tech":
    case "research":
    default:
      return "trending";
  }
}

/**
 * Legacy v25 local asset — brain CT on monitor (“brain on stick” family).
 * Never assign via matcher, backfill, or display resolver.
 */
export const BRAIN_SCAN_COVER_PATHS = ["/assets/covers/clinical.webp"] as const;

/** True when URL is the retired brain-scan hero (`clinical.webp`). */
export function isBrainScanCoverUrl(url: string | null | undefined): boolean {
  const path = normalizeLocalCoverPath(url);
  if (!path) return false;
  return (BRAIN_SCAN_COVER_PATHS as readonly string[]).includes(path);
}

/** True when URL points at clinical/lab/brain-style local covers. */
export function isClinicalOrBrainCoverUrl(url: string): boolean {
  if (isBrainScanCoverUrl(url)) return true;
  const lower = url.toLowerCase();
  if (!lower.includes("/assets/covers/")) return false;
  return CLINICAL_COVER_SLUGS.some((slug) => lower.includes(`/covers/${slug}.webp`));
}

/** True when URL is from the food visual pool. */
export function isFoodCoverUrl(url: string): boolean {
  const lower = url.toLowerCase();
  if (!lower.includes("/assets/covers/")) return false;
  return (
    lower.includes("/covers/food") ||
    lower.includes("/covers/produce")
  );
}

/** Dead / blocked remote IDs that 404 or are known-bad stock. */
const DEAD_OR_BAD_REMOTE = [
  "photo-1584515930387-285e4804f4cb",
  "photo-1523050854058-8df90110c9f1",
  "photo-1581579438749-86c8e8f9f9d0",
  "photo-1576765608535-5e04c5a8f0c0",
  "photo-1559757175-5700cde872bc",
  "photo-1584308664744-24d5c474f2ae",
  "photo-1478737270239-2f02e77f67c9",
  "photo-1576091160550-2173dba999ef", // dark hands clinical
  "photo-1576091160399-112ba8d25d1d", // brain-on-stick anatomy model (v25 default)
  "photo-1579684385127-1ef15d508118",
] as const;

/** v25 / Unsplash stock paths and IDs that must never appear on lifestyle articles. */
const DENIED_STOCK_PATTERNS = [
  /doctor-phone/i,
  /\/brain\b/i,
  /brain-on-stick/i,
  /photo-1576091160399/i,
  /photo-1576091160550/i,
  /photo-1559757175-0eb30cd8c063/i, // brain cross-section stock
] as const;

/** Which article topics each local cover asset is appropriate for. */
const LOCAL_COVER_TOPICS: Partial<
  Record<string, readonly CoverVisualTopic[]>
> = {
  "/assets/covers/food.webp": ["food"],
  "/assets/covers/food-2.webp": ["food"],
  "/assets/covers/food-3.webp": ["food"],
  "/assets/covers/food-4.webp": ["food"],
  "/assets/covers/produce.webp": ["food"],
  "/assets/covers/sleep.webp": ["sleep"],
  "/assets/covers/calm.webp": ["calm"],
  "/assets/covers/calm-2.webp": ["calm", "sleep"],
  "/assets/covers/movement.webp": ["movement", "walk"],
  "/assets/covers/movement-2.webp": ["movement", "walk"],
  "/assets/covers/walk.webp": ["walk", "movement", "seniors"],
  "/assets/covers/seniors.webp": ["seniors"],
  "/assets/covers/clinical-2.webp": ["clinical", "research", "vitals"],
  "/assets/covers/clinical-3.webp": ["clinical", "research"],
  "/assets/covers/research.webp": ["research", "clinical"],
  "/assets/covers/research-2.webp": ["research", "clinical"],
  "/assets/covers/science.webp": ["research", "tech"],
  "/assets/covers/tech.webp": ["tech"],
  "/assets/covers/vitals.webp": ["vitals", "clinical", "tech"],
};

const FOOD_RE =
  /tal[ií][rř]|st[rř]edo\s*mo[rř]|stredomorsk|kuchyn|strav|j[ií]dl|meal|diet|v[yý][zž]iv|sal[aá]t|olive|zelenin|protein|b[ií]lkovin|sytost|recept|j[ií]deln[ií][cč]ek|nutrition|hydrat|pitn[yý]\s+re[zž]im|pitn[eé]\s+re[zž]im|ovoce|sn[ií]dan|ve[cč]e[rř]|potravin/i;

const SLEEP_RE =
  /sp[aá]nek|sleep|apnoe|insomni|odpo[cč]ink|no[cč]n[ií]|polar|postel|unava|únava|jarn[ií]\s+unava|zimn[ií]\s+unava/i;

const CALM_RE =
  /stres|stress|mindful|meditac|dechov|relax|pohoda|imunit.*pr[aá]ce|wellness|klid|du[sš]evn|detox|wellbeing|přetížení\s*informac|pretizeni\s*informac/i;

const MOVEMENT_RE =
  /pohyb|cvi[cč]|fitness|sport|ch[uů]ze|walk|cvik|trenink|tr[eé]nink|svalov|svaly|posilov|sedav|sedent|neat\b|schod|st[aá]n[ií]|zam[eě]stn|kancel[aá][řr]|office/i;

const SENIORS_RE =
  /senior|st[aá][rř]nut|aging|menopauz|osteopor|hrt|d[uů]chod|kostn[ií]|[rř][ií]dnut[ií]\s+kost/i;

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
  // Title + slug only — excerpt often says “bez stresu” / “diet” / “klid” and must
  // not steal Mediterranean / protein / diabetes / kids heroes onto calm or food stock.
  const titleSlug = [input.title, input.slug].filter(Boolean).join(" ");
  const topic = (input.publicTopic ?? "").toLowerCase();

  // Strong title/slug signals before any excerpt-driven calm/food matches.
  // 1) Sleep before food — “zimní únava + pitný režim” stays sleep.
  // 2) Food before seniors/movement — “bílkoviny … senioři / síla” stays food.
  // 3) Clinical / kids / research before excerpt calm — “cukrovka… stres”, “školní… klid”.
  if (SLEEP_RE.test(titleSlug)) return "sleep";
  if (FOOD_RE.test(titleSlug) || topic.includes("strav")) return "food";
  if (SENIORS_RE.test(titleSlug)) return "seniors";
  if (KIDS_RE.test(titleSlug)) return "walk";
  if (VITALS_RE.test(titleSlug)) return "vitals";
  if (MOVEMENT_RE.test(titleSlug)) return "movement";
  // Digitální detox + duševní pohoda: calm/wellness hero, not tech/clinical stock.
  if (/digit[aá]ln[ií][\s-]*detox|detox.*du[sš]evn|du[sš]evn[ií]\s*pohod/i.test(titleSlug))
    return "calm";
  if (TECH_RE.test(titleSlug)) return "tech";
  if (RESEARCH_RE.test(titleSlug) || topic.includes("prevence")) return "research";
  if (CLINICAL_RE.test(titleSlug) || topic.includes("nemoci")) return "clinical";
  if (CALM_RE.test(titleSlug)) return "calm";

  // Weaker excerpt / category signals
  if (SLEEP_RE.test(hay)) return "sleep";
  if (CALM_RE.test(hay)) return "calm";
  if (FOOD_RE.test(hay)) return "food";
  if (MOVEMENT_RE.test(hay)) return "movement";
  if (SENIORS_RE.test(hay)) return "seniors";
  if (KIDS_RE.test(hay)) return "walk";
  if (VITALS_RE.test(hay)) return "vitals";
  if (TECH_RE.test(hay)) return "tech";
  if (RESEARCH_RE.test(hay) || topic.includes("prevence")) return "research";
  if (CLINICAL_RE.test(hay) || topic.includes("nemoci")) return "clinical";
  // Slug/title movement beats generic zivotni-styl → calm (e.g. sedavé zaměstnání / NEAT).
  if (MOVEMENT_RE.test(titleSlug)) return "movement";
  if (topic.includes("zivotni")) return "calm";
  if (topic.includes("rozhovor")) return "clinical";
  return "research";
}

/** Normalize absolute or relative cover URLs to `/assets/covers/…` path when local. */
export function normalizeLocalCoverPath(
  url: string | null | undefined
): string | null {
  if (!url?.trim()) return null;
  const raw = url.trim().split("?")[0]!;
  if (/^\/assets\/covers\//i.test(raw)) return raw.toLowerCase();
  try {
    const pathname = new URL(raw).pathname;
    if (/^\/assets\/covers\//i.test(pathname)) return pathname.toLowerCase();
  } catch {
    // not a URL
  }
  const idx = raw.toLowerCase().indexOf("/assets/covers/");
  if (idx >= 0) return raw.slice(idx).toLowerCase();
  return null;
}

export function pickCuratedCover(
  topic: CoverVisualTopic,
  seed: string
): string {
  const pool = COVER_POOL[topic] ?? COVER_POOL.research;
  const allowed = pool.filter((path) => {
    const topics = LOCAL_COVER_TOPICS[path.toLowerCase()];
    return !topics || topics.includes(topic);
  });
  const use = allowed.length > 0 ? allowed : pool;
  return use[hashString(seed) % use.length]!;
}

export function isDeniedStockUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const lower = url.toLowerCase();
  if (DENIED_STOCK_PATTERNS.some((pattern) => pattern.test(lower))) return true;
  if (DEAD_OR_BAD_REMOTE.some((id) => lower.includes(id))) return true;
  return false;
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
  if (isDeniedStockUrl(url)) return true;
  return false;
}

/** Stored local cover does not match the article topic (e.g. clinical.webp on food copy). */
export function isMismatchedLocalCover(
  url: string | null | undefined,
  topic: CoverVisualTopic
): boolean {
  const normalized = normalizeLocalCoverPath(url);
  if (!normalized) return false;
  const allowed = LOCAL_COVER_TOPICS[normalized];
  if (!allowed) return false;
  return !allowed.includes(topic);
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

  if (
    isBrokenCoverUrl(raw) ||
    (raw && isDeniedStockUrl(raw)) ||
    (raw && isBrainScanCoverUrl(raw))
  ) {
    return input.preferCurated === false ? null : curated;
  }

  if (raw && isStaleGenericStockUrl(raw)) {
    return curated;
  }

  // Local covers (relative or absolute site URL): keep only when topic-appropriate
  const localPath = normalizeLocalCoverPath(raw);
  if (localPath) {
    if (isBrainScanCoverUrl(localPath)) return curated;
    return isMismatchedLocalCover(localPath, topic) ? curated : localPath;
  }

  // Marketing / newsletter art — keep as-is
  if (
    raw &&
    (/\/assets\/newsletter\//i.test(raw) || /\/assets\/marketing\//i.test(raw))
  ) {
    return raw;
  }

  // Unknown remote — keep if it looks like a real raster URL
  if (raw && /\.(webp|jpe?g|png)(\?|$)/i.test(raw)) {
    return raw;
  }

  return input.preferCurated === false ? null : curated;
}

/** True when stored cover should be rewritten (stale v25, brain scan, or topic mismatch). */
export function articleNeedsCoverRemediation(input: {
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  category?: string | null;
  publicTopic?: string | null;
  coverImageUrl?: string | null;
}): boolean {
  const raw = input.coverImageUrl?.trim() || null;
  if (!raw) return true;
  if (
    isBrokenCoverUrl(raw) ||
    isStaleGenericStockUrl(raw) ||
    isDeniedStockUrl(raw) ||
    isBrainScanCoverUrl(raw)
  ) {
    return true;
  }
  const topic = classifyCoverTopic(input);
  const localPath = normalizeLocalCoverPath(raw);
  if (localPath) {
    if (isBrainScanCoverUrl(localPath)) return true;
    if (isMismatchedLocalCover(localPath, topic)) return true;
  }
  const resolved = resolveArticleCoverUrl({
    title: input.title,
    slug: input.slug ?? undefined,
    excerpt: input.excerpt,
    category: input.category,
    publicTopic: input.publicTopic,
    coverImageUrl: input.coverImageUrl,
    preferCurated: true,
  });
  return (resolved ?? null) !== raw;
}
