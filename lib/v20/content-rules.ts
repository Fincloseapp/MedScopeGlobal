/**
 * v20.1 content governance — Czech-only, archive pre-2026 legacy, v19 brief TTL.
 */
import { V19_RUBRIC_SLUG } from "@/lib/v19/dedup";
import type { ArticleWithRelations } from "@/types/database";

/** Legacy articles before this date are archived. */
export const V20_ARCHIVE_CUTOFF = "2026-01-01T00:00:00.000Z";

/** v19 briefs visible max age (days). */
export const V20_V19_MAX_AGE_DAYS = 45;

const EN_TITLE_RE =
  /\b(the|and|for|with|study|clinical|trial|patients|treatment|review|analysis|healthcare)\b/i;

export function isArchivedArticle(article: {
  published_at?: string | null;
  created_at?: string | null;
  rubric_slug?: string | null;
}): boolean {
  const date = article.published_at ?? article.created_at;
  if (!date) return true;

  const ts = new Date(date).getTime();
  if (Number.isNaN(ts)) return true;

  // v19 briefs — keep recent only
  if (article.rubric_slug === V19_RUBRIC_SLUG) {
    const ageMs = Date.now() - ts;
    return ageMs > V20_V19_MAX_AGE_DAYS * 86_400_000;
  }

  // Pre-cutoff legacy DB rows stay archived; v24+ pipeline content after cutoff stays live
  return ts < new Date(V20_ARCHIVE_CUTOFF).getTime();
}

export function filterActiveArticles<T extends ArticleWithRelations>(articles: T[]): T[] {
  return articles.filter((a) => !isArchivedArticle(a));
}

/** Czech-only: drop EN locale and English-looking titles. */
export function filterCzechContent<T extends { title?: string; locale?: string | null }>(
  articles: T[],
  locale: string
): T[] {
  if (locale !== "cs") return articles;
  return articles.filter((a) => {
    if (a.locale === "en") return false;
    const title = a.title?.trim() ?? "";
    if (!title) return false;
    if (EN_TITLE_RE.test(title) && !/[áčďéěíňóřšťúůýž]/i.test(title)) return false;
    return true;
  });
}

export function enrichArticleMeta(article: {
  title: string;
  excerpt?: string | null;
  summary?: string | null;
  categories?: { name?: string } | null;
}) {
  const category = article.categories?.name ?? "Odborný článek";
  const summary =
    article.excerpt?.trim() ||
    article.summary?.trim() ||
    `${article.title} — odborné shrnutí z oblasti ${category}. Zdroje ověřeny, obsah pro vzdělávání.`;
  const metaTitle = `${article.title} | MedScopeGlobal`;
  const metaDescription = summary.slice(0, 160);
  return { metaTitle, metaDescription, professionalSummary: summary };
}
