/** Magazine listing minimum — aligns with audit THRESHOLD_MAGAZINE (800w). */
export const MAGAZINE_LISTING_MIN_WORDS = 800;

const SEED_STATIC_SLUG_RE =
  /^verejnost-(zivotni-styl|prevence|nemoci|rozhovor)-/;

const PUBLIC_CRON_SLUG_RE = /verejnost-[a-z0-9-]+-\d{4}-\d{2}-\d{2}-/;

type ListingArticle = {
  title?: string | null;
  slug?: string | null;
  vip_only?: boolean | null;
  content?: string | null;
  metadata?: unknown;
  rubric_slug?: string | null;
  source_name?: string | null;
};

function metaRecord(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return {};
}

export function countArticleWords(content: string | null | undefined): number {
  return String(content ?? "")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Static seed/demo cards from seed-public-articles.ts and demo-magazine-articles.ts. */
export function isSeedOrDemoArticle(article: ListingArticle): boolean {
  const slug = String(article.slug ?? "");
  const meta = metaRecord(article.metadata);
  const source = String(article.source_name ?? "");

  if (meta.demo === true || meta.seed === true) return true;
  if (slug.startsWith("demo-")) return true;
  if (/demo magazín/i.test(source)) return true;

  if (SEED_STATIC_SLUG_RE.test(slug) && !/\d{4}-\d{2}-\d{2}/.test(slug)) {
    return true;
  }

  return false;
}

/** v19 brief / foreign ingest rows — not magazine-depth writers. */
export function isBriefIngestArticle(article: ListingArticle): boolean {
  const slug = String(article.slug ?? "");
  const rubric = String(article.rubric_slug ?? "").toLowerCase();
  const meta = metaRecord(article.metadata);
  const section = String(meta.section ?? "").toLowerCase();

  if (isSeedOrDemoArticle(article)) return false;
  if (PUBLIC_CRON_SLUG_RE.test(slug)) return false;

  if (
    rubric === "aktualni-zpravy" ||
    /novink|aktualni|aktuální|zprav|news|foreign/.test(rubric)
  ) {
    return true;
  }
  if (/news|zprav|aktual|novinky/.test(section)) return true;

  if (!slug.startsWith("verejnost-") && !slug.startsWith("demo-")) {
    if (/delphi|consensus|guidelines|clinical-trial/i.test(slug)) return true;
    return true;
  }

  return false;
}

/** Known demo/seed slugs to unpublish when running maintenance scripts. */
export const SEED_DEMO_SLUGS = [
  "verejnost-zivotni-styl-zdravy-spanek",
  "verejnost-prevence-screening-a-ockovani",
  "verejnost-nemoci-kdy-vyhledat-lekare",
  "verejnost-rozhovor-kardiolog-prevence-srdce",
  "verejnost-zivotni-styl-vyziva-bez-extremu",
  "demo-dlouhovekost-healthspan-zaklady",
  "demo-novinky-prevence-v-cesku",
] as const;

/**
 * Magazine hub / listing filter only.
 * Do not use this to 404 article detail — special-access medical
 * articles (vip_only) must still resolve so existing eligibility can run.
 */
export function shouldHideFromPublicListing(
  article: ListingArticle,
  _now = new Date()
): boolean {
  if (!article.slug?.trim() || !article.title?.trim()) return true;
  if (article.vip_only) return true;

  const nativeDesk = metaRecord(article.metadata).native_desk === true;
  if (isSeedOrDemoArticle(article) && !nativeDesk) return true;
  if (nativeDesk) {
    return countArticleWords(article.content) < 60;
  }

  const words = countArticleWords(article.content);
  // Hide short stubs from magazine hubs until expanded to longform (800–1500).
  // Applies to brief ingest AND under-length cron/persona drafts so /articles,
  // homepage, and /verejnost/clanky never surface thin cards next to full pieces.
  if (words > 0 && words < MAGAZINE_LISTING_MIN_WORDS) {
    return true;
  }
  if (isBriefIngestArticle(article) && words < MAGAZINE_LISTING_MIN_WORDS) {
    return true;
  }

  return false;
}

export function filterMagazineListableArticles<T extends ListingArticle>(
  articles: T[]
): T[] {
  return articles.filter((article) => !shouldHideFromPublicListing(article));
}
