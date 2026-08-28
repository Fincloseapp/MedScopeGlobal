/**
 * Homepage + magazine desks: Novinky, Veřejnost, Dlouhověkost, Články.
 * Classification is exclusive (longevity → news → public → magazine).
 */
import { shouldHideFromPublicListing } from "@/lib/editorial/article-quality-audit";
import { mixFreshFeed, selectResurfaceCandidates } from "@/lib/editorial/freshness";
import { resolveWriterAgent } from "@/lib/editorial/writer-agents";
import { filterActiveArticles, filterCzechContent, isArchivedArticle } from "@/lib/v20/content-rules";
import type { DisplayArticle } from "@/lib/articles/prepare-for-display";

export type NewsDeskId = "novinky" | "verejnost" | "dlouhovekost" | "clanky";

export type NewsDeskDef = {
  id: NewsDeskId;
  label: string;
  href: string;
  more: string;
  kicker: string;
  blurb: string;
};

export const NEWS_DESKS: NewsDeskDef[] = [
  {
    id: "novinky",
    label: "Novinky",
    href: "/novinky",
    more: "Všechny novinky",
    kicker: "Aktuálně",
    blurb: "Zdravotnické události s kontextem pro Česko — bez senzace.",
  },
  {
    id: "verejnost",
    label: "Veřejnost",
    href: "/verejnost/clanky",
    more: "Články pro veřejnost",
    kicker: "Veřejné zdraví",
    blurb: "Prevence, nemoci a životní styl srozumitelně a právně korektně.",
  },
  {
    id: "dlouhovekost",
    label: "Dlouhověkost",
    href: "/verejnost/clanky?topic=dlouhovekost",
    more: "Celá oblast",
    kicker: "Healthspan",
    blurb: "Spánek, pohyb, výživa a biomarkery — co je důkaz a co je hype.",
  },
  {
    id: "clanky",
    label: "Články",
    href: "/articles",
    more: "Otevřít magazín",
    kicker: "Magazín",
    blurb: "Aktuální redakční čtení s fotografiemi a nezávislou kontrolou.",
  },
];

const LONGEVITY_RE =
  /dlouhověk|dlouhovek|longevity|healthspan|stárnut|starnut|biologický věk|biologicky vek|sarkopen|vo2\s*max|žít déle|zit dele/i;

const NEWS_RE =
  /novink|zpráv|zprav|ema\b|súkl|sukl|\bwho\b|mzčr|mzcr|cdc\b|outbreak|epidem|guideline|agentur/i;

function metaRecord(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return {};
}

export function isLongevityArticle(article: {
  title?: string | null;
  excerpt?: string | null;
  public_topic?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  const agent = resolveWriterAgent(article);
  if (agent?.id === "writer5") return true;
  const meta = metaRecord(article.metadata);
  const pillar = String(meta.content_pillar ?? meta.internal_topic ?? "")
    .toLowerCase()
    .trim();
  if (pillar === "dlouhovekost") return true;
  if (String(article.public_topic ?? "").toLowerCase() === "dlouhovekost") return true;
  return LONGEVITY_RE.test(`${article.title ?? ""} ${article.excerpt ?? ""}`);
}

export function isNovinkyArticle(article: {
  title?: string | null;
  excerpt?: string | null;
  rubric_slug?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  const rubric = String(article.rubric_slug ?? "").toLowerCase();
  if (
    /novink|aktualni|aktuální|zprav|news|foreign/.test(rubric) ||
    rubric === "aktualni-zpravy"
  ) {
    return true;
  }
  const meta = metaRecord(article.metadata);
  const section = String(meta.section ?? "").toLowerCase();
  if (/news|zprav|aktual/.test(section)) return true;
  return NEWS_RE.test(`${article.title ?? ""} ${article.excerpt ?? ""}`);
}

export function isVerejnostArticle(article: {
  audience?: string | null;
  public_topic?: string | null;
  rubric_slug?: string | null;
  min_access_level?: string | null;
}): boolean {
  if (article.audience === "public") return true;
  if (article.public_topic) return true;
  if (article.rubric_slug === "verejnost") return true;
  return (article.min_access_level ?? "public") === "public";
}

export function classifyNewsDesk(article: DisplayArticle): NewsDeskId {
  if (isLongevityArticle(article)) return "dlouhovekost";
  if (isNovinkyArticle(article)) return "novinky";
  if (isVerejnostArticle(article)) return "verejnost";
  return "clanky";
}

export function isListableNewsArticle(article: DisplayArticle, now = new Date()): boolean {
  if (!article.slug || !article.title?.trim()) return false;
  // In-memory demo pack (id demo-magazine-*) is the readable fallback when CMS
  // has no translated longform. shouldHideFromPublicListing hides seed/demo stubs
  // from the database on purpose — do not apply that to the localized pack.
  if (String(article.id ?? "").startsWith("demo-magazine-")) {
    return !isArchivedArticle(article);
  }
  if (shouldHideFromPublicListing(article, now)) return false;
  const display = String(article.displayLocale ?? article.locale ?? "cs");
  const czechOnly = display === "cs" || display.startsWith("cs");
  return filterCzechContent(filterActiveArticles([article]), czechOnly ? "cs" : display)
    .length === 1;
}

export function splitNewsDesks(
  articles: DisplayArticle[],
  limits: Partial<Record<NewsDeskId, number>> = {}
): Record<NewsDeskId, DisplayArticle[]> {
  const cap: Record<NewsDeskId, number> = {
    novinky: limits.novinky ?? 4,
    verejnost: limits.verejnost ?? 4,
    dlouhovekost: limits.dlouhovekost ?? 4,
    clanky: limits.clanky ?? 6,
  };
  const desks: Record<NewsDeskId, DisplayArticle[]> = {
    novinky: [],
    verejnost: [],
    dlouhovekost: [],
    clanky: [],
  };
  const listable = articles.filter((article) => isListableNewsArticle(article));
  for (const article of listable) {
    const desk = classifyNewsDesk(article);
    if (desks[desk].length < cap[desk]) desks[desk].push(article);
  }

  if (desks.clanky.length < cap.clanky) {
    const used = new Set(
      [...desks.novinky, ...desks.verejnost, ...desks.dlouhovekost, ...desks.clanky].map(
        (article) => article.id
      )
    );
    for (const article of listable) {
      if (desks.clanky.length >= cap.clanky) break;
      if (used.has(article.id)) continue;
      desks.clanky.push(article);
      used.add(article.id);
    }
  }

  return desks;
}

export function mixListableFeed(articles: DisplayArticle[], limit: number): DisplayArticle[] {
  const listable = articles.filter((article) => isListableNewsArticle(article));
  const resurface = selectResurfaceCandidates(listable, Math.max(4, Math.ceil(limit / 3)));
  return mixFreshFeed(listable, resurface, limit);
}

export function filterArticlesForDesk(
  articles: DisplayArticle[],
  desk: NewsDeskId | null
): DisplayArticle[] {
  const listable = articles.filter((article) => isListableNewsArticle(article));
  if (!desk || desk === "clanky") return listable;
  return listable.filter((article) => classifyNewsDesk(article) === desk);
}
