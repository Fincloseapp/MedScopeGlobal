import type { DisplayArticle } from "@/lib/articles/prepare-for-display";
import { formatPublicDate } from "@/lib/i18n/format-date";
import { normalizeTitleKey } from "@/lib/v19/dedup";

export type ArticleDateLabel = {
  text: string;
  dateTime: string;
};

/** Stable page key so the same story cannot occupy two homepage slots. */
export function articlePageKey(article: {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
}): string {
  const slug = String(article.slug ?? "").toLowerCase().trim();
  if (slug) return `slug:${slug}`;
  const title = normalizeTitleKey(article.title ?? "");
  if (title) return `title:${title}`;
  return article.id ? `id:${article.id}` : "";
}

export type ArticleDateFields = {
  slug?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  listing_published_at?: string | null;
};

/**
 * Visible date for cards and article chrome.
 * Wire news keeps the real published_at so rewrites cannot make July look like August.
 * Other desks: listing roll wins; otherwise a real rewrite (`updated_at`) beats publish.
 */
export function articleDisplayDate(article: ArticleDateFields): string | null {
  const slug = String(article.slug ?? "").toLowerCase();
  if (slug.startsWith("zpravy-")) {
    return article.published_at ?? article.updated_at ?? null;
  }
  if (article.listing_published_at) return article.listing_published_at;
  const published = article.published_at ?? null;
  const updated = article.updated_at ?? null;
  if (updated && published) {
    const u = Date.parse(updated);
    const p = Date.parse(published);
    if (Number.isFinite(u) && Number.isFinite(p) && u > p + 60_000) return updated;
  }
  return published ?? updated ?? null;
}

export function articleWasRefreshed(article: ArticleDateFields): boolean {
  const published = article.published_at ? Date.parse(article.published_at) : NaN;
  const updated = article.updated_at ? Date.parse(article.updated_at) : NaN;
  return Number.isFinite(published) && Number.isFinite(updated) && updated > published + 12 * 3_600_000;
}

/**
 * Evergreen category cards older than a week get a deterministic listing
 * date in the last week. News keeps the real published_at.
 */
export function rollEvergreenListingDate(
  article: { slug?: string | null; id?: string | null; published_at?: string | null },
  now = new Date()
): string | null {
  const published = article.published_at ? Date.parse(article.published_at) : NaN;
  if (!Number.isFinite(published)) return article.published_at ?? null;
  const ageDays = (now.getTime() - published) / 86_400_000;
  if (ageDays < 7) return article.published_at ?? null;
  const token = String(article.slug || article.id || "");
  let hash = 0;
  for (let i = 0; i < token.length; i += 1) hash = (hash + token.charCodeAt(i)) % 7;
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - hash, 8, 0, 0)
  ).toISOString();
}

export function withCategoryListingDate<T extends DisplayArticle>(
  article: T,
  desk: "novinky" | "verejnost" | "dlouhovekost" | "clanky",
  now = new Date()
): T {
  if (desk === "novinky") return article;
  if (articleWasRefreshed(article)) {
    const updated = article.updated_at ?? null;
    const ageDays = updated ? (now.getTime() - Date.parse(updated)) / 86_400_000 : Infinity;
    if (updated && ageDays < 7) {
      return { ...article, listing_published_at: updated };
    }
  }
  const listing = rollEvergreenListingDate(article, now);
  if (!listing || listing === article.published_at) return article;
  return { ...article, listing_published_at: listing };
}

export function formatArticleDateLabel(
  articleOrIso?: DisplayArticle | string | null,
  locale?: string | null
): ArticleDateLabel | null {
  const iso =
    typeof articleOrIso === "string"
      ? articleOrIso
      : articleOrIso
        ? articleDisplayDate(articleOrIso)
        : null;
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const uiLocale =
    locale ??
    (typeof articleOrIso === "object" && articleOrIso
      ? articleOrIso.displayLocale
      : null);
  return {
    dateTime: d.toISOString(),
    text:
      formatPublicDate(d, uiLocale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }) ?? "",
  };
}

/** Prefer newest items, then fill with resurface candidates. */
export function mixFreshFeed(
  fresh: DisplayArticle[],
  resurface: DisplayArticle[],
  limit: number
): DisplayArticle[] {
  const out: DisplayArticle[] = [];
  const seen = new Set<string>();
  for (const article of [...fresh, ...resurface]) {
    if (out.length >= limit) break;
    if (!article.id || seen.has(article.id)) continue;
    seen.add(article.id);
    out.push(article);
  }
  return out;
}

/** Older-but-still-active pieces to keep desks from looking empty. */
export function selectResurfaceCandidates(
  articles: DisplayArticle[],
  limit: number
): DisplayArticle[] {
  const sorted = [...articles].sort((a, b) => {
    const ta = new Date(a.published_at ?? 0).getTime();
    const tb = new Date(b.published_at ?? 0).getTime();
    return ta - tb;
  });
  return sorted.slice(0, Math.max(0, limit));
}
