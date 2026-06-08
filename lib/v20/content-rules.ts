/**
 * v20 content governance — Czech-first, archive stale, newest-first.
 */
import type { ArticleWithRelations } from "@/types/database";

/** Articles published before this date are hidden from public listings (archived). */
export const V20_ARCHIVE_CUTOFF = "2026-01-01T00:00:00.000Z";

/** Max age for listing in days (legacy articles without recent updates). */
export const V20_MAX_LIST_AGE_DAYS = 365;

export function isArchivedArticle(article: {
  published_at?: string | null;
  created_at?: string | null;
  rubric_slug?: string | null;
}): boolean {
  const date = article.published_at ?? article.created_at;
  if (!date) return true;
  const ts = new Date(date).getTime();
  if (Number.isNaN(ts)) return true;
  if (ts < new Date(V20_ARCHIVE_CUTOFF).getTime()) return true;
  const ageMs = Date.now() - ts;
  if (ageMs > V20_MAX_LIST_AGE_DAYS * 86_400_000) return true;
  return false;
}

export function filterActiveArticles<T extends ArticleWithRelations>(articles: T[]): T[] {
  return articles.filter((a) => !isArchivedArticle(a));
}

/** Prefer Czech content; drop obvious EN-only legacy rows in CS mode. */
export function filterCzechContent<T extends { title?: string; locale?: string | null }>(
  articles: T[],
  locale: string
): T[] {
  if (locale !== "cs") return articles;
  return articles.filter((a) => {
    if (a.locale === "en") return false;
    return Boolean(a.title?.trim());
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
