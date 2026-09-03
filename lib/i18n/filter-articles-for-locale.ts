/**
 * Native-first magazine listings.
 * Each language desk writes for its readers. Foreign MedScopeGlobal desks may
 * be shared with attribution — Czech-only institutions never appear as local
 * advice on /en-us, /fr, /it, …
 */

import {
  isCzechOnlyInstitutional,
  isShareableMagazineTopic,
  relatedBorrowLocales,
} from "@/lib/editorial/geopolitical-topics";
import {
  matchesArticleLocale,
  primaryArticleLocale,
  resolveArticleLocales,
} from "@/lib/i18n/article-locale";
import { normalizeLocale, type LocaleCode } from "@/lib/i18n/config";

export type LocaleListingArticle = {
  id?: string;
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  locale?: string | null;
  public_topic?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type LocaleListingOptions = {
  /** Keep at least this many native pieces before filling from other desks. */
  minNative?: number;
  /** Extra foreign-desk shares even when native coverage is healthy. */
  courtesyBorrow?: number;
  /** Hard cap on borrowed / syndicated rows. */
  maxBorrow?: number;
};

function metaRecord(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return {};
}

export function isNativeForLocale(
  article: LocaleListingArticle,
  uiLocale: LocaleCode
): boolean {
  return matchesArticleLocale(article.locale, uiLocale);
}

/** Explicit syndication from another MedScopeGlobal desk. */
export function isExplicitSyndication(
  article: LocaleListingArticle,
  uiLocale: LocaleCode
): boolean {
  const meta = metaRecord(article.metadata);
  const target = String(meta.syndication_target_locale ?? meta.syndicated_to_locale ?? "");
  if (target && resolveArticleLocales(uiLocale).includes(target)) return true;
  if (meta.syndicated_from || meta.syndicated_from_locale || meta.syndicated_from_slug) {
    return true;
  }
  if (meta.native_first === false && meta.syndicated_from_locale) return true;
  return false;
}

function sourceLocaleOf(article: LocaleListingArticle): string | null {
  const meta = metaRecord(article.metadata);
  const tagged = meta.syndicated_from_locale;
  if (typeof tagged === "string" && tagged.trim()) return tagged;
  return article.locale ?? null;
}

function relatedScore(article: LocaleListingArticle, uiLocale: LocaleCode): number {
  const related = relatedBorrowLocales(uiLocale);
  const source = sourceLocaleOf(article);
  if (!source) return 0;
  if (related.includes(source)) return 2;
  if (related.includes(source.split("-")[0] ?? "")) return 1;
  return 0;
}

function sortBorrowable<T extends LocaleListingArticle>(
  articles: T[],
  uiLocale: LocaleCode
): T[] {
  return [...articles].sort((a, b) => relatedScore(b, uiLocale) - relatedScore(a, uiLocale));
}

/**
 * Czech edition: keep the existing Czech-only listing.
 * Other editions: native first, then attributed shares of internationally
 * relevant longevity / slim-health / lifestyle / biohacking pieces.
 */
export function filterArticlesForLocale<T extends LocaleListingArticle>(
  articles: T[],
  locale?: string | null,
  options: LocaleListingOptions = {}
): T[] {
  const ui = normalizeLocale(locale ?? "cs");
  if (primaryArticleLocale(ui) === "cs") {
    return articles.filter((article) => {
      if (article.locale === "en") return false;
      const title = article.title?.trim() ?? "";
      if (!title) return false;
      if (
        /\b(the|and|for|with|study|clinical|trial|patients|treatment|review|analysis|healthcare)\b/i.test(
          title
        ) &&
        !/[áčďéěíňóřšťúůýž]/i.test(title)
      ) {
        return false;
      }
      return true;
    });
  }

  const minNative = options.minNative ?? 8;
  const courtesyBorrow = options.courtesyBorrow ?? 4;
  const maxBorrow = options.maxBorrow ?? 12;

  const native: T[] = [];
  const syndicated: T[] = [];
  const borrowable: T[] = [];

  for (const article of articles) {
    if (!article.title?.trim() && !article.slug) continue;
    if (isNativeForLocale(article, ui)) {
      native.push(article);
      continue;
    }
    if (isCzechOnlyInstitutional(article)) continue;
    if (isExplicitSyndication(article, ui)) {
      syndicated.push(article);
      continue;
    }
    if (isShareableMagazineTopic(article)) {
      borrowable.push(article);
    }
  }

  const seen = new Set<string>();
  const out: T[] = [];
  const remember = (article: T) => {
    const key = String(article.id ?? article.slug ?? "");
    if (key && seen.has(key)) return false;
    if (key) seen.add(key);
    out.push(article);
    return true;
  };

  for (const article of native) remember(article);
  let borrowed = 0;
  for (const article of syndicated) {
    if (borrowed >= maxBorrow) break;
    if (remember(article)) borrowed += 1;
  }

  const fillBudget = Math.min(
    maxBorrow,
    Math.max(courtesyBorrow, Math.max(0, minNative - native.length))
  );
  for (const article of sortBorrowable(borrowable, ui)) {
    if (borrowed >= fillBudget) break;
    if (remember(article)) borrowed += 1;
  }

  return out;
}

export function isListableInLocale(
  article: LocaleListingArticle,
  locale?: string | null
): boolean {
  return filterArticlesForLocale([article], locale, {
    minNative: 0,
    courtesyBorrow: 1,
    maxBorrow: 1,
  }).length === 1;
}
