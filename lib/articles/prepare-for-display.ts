import { localizeCategories } from "@/lib/i18n/category-label";
import { normalizeLegacyCategory } from "@/lib/i18n/category-normalize";
import {
  matchesArticleLocale,
  primaryArticleLocale,
} from "@/lib/i18n/article-locale";
import { looksLikeCzech } from "@/lib/i18n/czech-detect";
import type { LocaleCode } from "@/lib/i18n/config";
import { mapPool } from "@/lib/i18n/map-pool";
import { getCachedTranslations, resolveArticleTranslation, saveCachedTranslation } from "@/lib/i18n/translate-article";
import { fallbackTranslateFields } from "@/lib/i18n/translate-fallback";
import type { ArticleWithRelations } from "@/types/database";
import { dedupeArticlesByTitle } from "@/lib/articles/dedupe";
import { enrichArticleBodyForDisplay } from "@/lib/articles/enrich-body";
import { polishCzechFields } from "@/lib/v22/translate";
import {
  assignEditorialUnits,
  publicEditorialByline,
  type EditorialAssignment,
} from "@/lib/editorial/units";
import { resolveArticleCoverUrl } from "@/lib/ecosystem/editorial/images/cover";
import { assignUniqueListingCovers } from "@/lib/ecosystem/editorial/images/unique-listing-covers";
import { applyMagazineDeskCopy } from "@/lib/editorial/magazine-desk-copy";

export type DisplayArticle = ArticleWithRelations & {
  displayLocale?: string;
  translatedFrom?: string | null;
  translation_provider?: string;
  machine_translated?: boolean;
  reviewed?: boolean;
  editorialAssignment?: EditorialAssignment;
  editorialPrimaryLabel?: string;
};

function attachEditorialDisplay(
  article: ArticleWithRelations,
  locale: LocaleCode,
  extra?: Partial<DisplayArticle>
): DisplayArticle {
  const assignment = assignEditorialUnits(article ?? {});
  // Czech magazine desk overrides must not clobber DE/FR/IT/… translations.
  const desk =
    primaryArticleLocale(locale) === "cs"
      ? applyMagazineDeskCopy({ ...article, ...extra })
      : { ...article, ...extra };
  const merged = { ...article, ...extra, ...desk };
  const cover_image_url = resolveArticleCoverUrl({
    title: merged.title ?? "",
    slug: merged.slug,
    excerpt: merged.excerpt,
    category: merged.categories?.name,
    publicTopic: merged.public_topic,
    coverImageUrl: merged.cover_image_url,
    preferCurated: true,
  });
  return {
    ...merged,
    cover_image_url,
    editorialAssignment: assignment,
    editorialPrimaryLabel: publicEditorialByline(locale),
  };
}

function withoutCzechListingCopy(row: DisplayArticle, locale: LocaleCode): DisplayArticle | null {
  if (primaryArticleLocale(locale) === "cs") return row;
  let title = row.title;
  let excerpt = row.excerpt;
  if (looksLikeCzech(excerpt)) excerpt = looksLikeCzech(title) ? null : title;
  if (looksLikeCzech(title)) return null;
  return { ...row, excerpt };
}

function sortByLocalePreference(
  articles: ArticleWithRelations[],
  locale: LocaleCode
) {
  return [...articles].sort((a, b) => {
    const aMatch = matchesArticleLocale(a.locale, locale) ? 1 : 0;
    const bMatch = matchesArticleLocale(b.locale, locale) ? 1 : 0;
    if (bMatch !== aMatch) return bMatch - aMatch;
    const da = a.published_at ? new Date(a.published_at).getTime() : 0;
    const db = b.published_at ? new Date(b.published_at).getTime() : 0;
    return db - da;
  });
}

async function applyCategoryLabels(
  article: ArticleWithRelations,
  locale: LocaleCode
): Promise<ArticleWithRelations> {
  if (!article.categories) return article;

  const normalized =
    normalizeLegacyCategory(article.categories, {
      title: article.title,
      excerpt: article.excerpt,
      public_topic: article.public_topic,
    }) ?? article.categories;

  const [cat] = await localizeCategories([normalized], locale);
  return { ...article, categories: cat ?? normalized };
}

export async function prepareArticleForDisplay(
  article: ArticleWithRelations,
  locale: LocaleCode,
  mode: "card" | "full" = "full",
  options?: { live?: boolean }
): Promise<DisplayArticle> {
  let base = await applyCategoryLabels(article, locale);
  const target = primaryArticleLocale(locale);

  if (matchesArticleLocale(base.locale, locale)) {
    const polished = locale === "cs" ? polishCzechFields(base, locale) : base;
    const display = attachEditorialDisplay(polished, locale, { displayLocale: target });
    if (mode === "full" && target === "cs") {
      return { ...display, content: enrichArticleBodyForDisplay(display) };
    }
    return display;
  }

  const translated = await resolveArticleTranslation(
    base.id,
    {
      title: base.title,
      excerpt: base.excerpt,
      content: base.content,
      locale: base.locale,
    },
    locale,
    mode,
    { live: options?.live }
  );

  if (!translated) {
    if (locale === "cs") {
      const polished = polishCzechFields(base, "cs");
      return attachEditorialDisplay(base, locale, {
        title: polished.title,
        excerpt: polished.excerpt,
        content:
          mode === "full"
            ? enrichArticleBodyForDisplay({ ...polished, content: polished.content ?? base.content })
            : polished.content ?? base.content,
        displayLocale: target,
        translatedFrom: base.locale ?? "en",
      });
    }
    const lastResort = await fallbackTranslateFields({
      title: base.title,
      excerpt: base.excerpt,
      content: base.content,
      sourceLocale: base.locale ?? "cs",
      targetLocale: locale,
      mode: "card",
    }).catch(() => null);
    const rescueTitle =
      lastResort && !looksLikeCzech(lastResort.title) ? lastResort.title : "";
    const rescueExcerpt =
      lastResort && lastResort.excerpt && !looksLikeCzech(lastResort.excerpt)
        ? lastResort.excerpt
        : null;
    return attachEditorialDisplay(base, locale, {
      title: rescueTitle || (looksLikeCzech(base.title) ? rescueExcerpt ?? "" : base.title),
      excerpt: rescueExcerpt,
      content: rescueExcerpt ? `<p>${rescueExcerpt}</p>` : "",
      displayLocale: target,
      translatedFrom: base.locale ?? null,
      translation_provider: lastResort?.translation_provider,
      machine_translated: Boolean(rescueTitle),
      reviewed: false,
    });
  }

  let title = translated.title;
  let excerpt = translated.excerpt ?? base.excerpt;
  let content =
    translated.content ??
    (target === "cs" ? base.content : translated.excerpt ? `<p>${translated.excerpt}</p>` : "");

  if (target !== "cs") {
    if (looksLikeCzech(title)) title = excerpt && !looksLikeCzech(excerpt) ? excerpt : title;
    if (looksLikeCzech(excerpt)) excerpt = looksLikeCzech(title) ? null : title;
    if (looksLikeCzech(content)) {
      content = excerpt && !looksLikeCzech(excerpt) ? `<p>${excerpt}</p>` : "";
    }
    if (!title.trim() && excerpt && !looksLikeCzech(excerpt)) title = excerpt;
  }
  const merged = {
    ...base,
    title,
    excerpt,
    content,
  };
  const polished = locale === "cs" ? polishCzechFields(merged, locale) : merged;
  const enriched =
    mode === "full" && target === "cs"
      ? enrichArticleBodyForDisplay({
          ...polished,
          title: polished.title,
          excerpt: polished.excerpt,
          content: polished.content ?? content,
        })
      : polished.content ?? content;

  return attachEditorialDisplay(base, locale, {
    title: polished.title,
    excerpt: polished.excerpt,
    content: enriched,
    displayLocale: target,
    translatedFrom: base.locale ?? null,
    translation_provider: translated.translation_provider,
    machine_translated: translated.machine_translated,
    reviewed: translated.reviewed,
  });
}

function finalizePreparedListing(
  rows: DisplayArticle[],
  locale: LocaleCode
): DisplayArticle[] {
  const cleaned = rows
    .map((row) => withoutCzechListingCopy(row, locale))
    .filter((row): row is DisplayArticle => Boolean(row));
  return assignUniqueListingCovers(cleaned);
}

export async function prepareArticlesForDisplay(
  articles: ArticleWithRelations[],
  locale: LocaleCode,
  options?: { mode?: "card" | "full"; maxTranslate?: number; maxLive?: number }
): Promise<DisplayArticle[]> {
  const sorted = sortByLocalePreference(dedupeArticlesByTitle(articles), locale);
  const mode = options?.mode ?? "card";
  const maxTranslate = options?.maxTranslate ?? 24;

  let translateUsed = 0;
  const plan = sorted.map((article) => {
    const needsTranslation = !matchesArticleLocale(article.locale, locale);
    if (!needsTranslation) {
      return { article, kind: "native" as const };
    }
    if (translateUsed >= maxTranslate) {
      return { article, kind: "passthrough" as const };
    }
    translateUsed += 1;
    return { article, kind: "translate" as const };
  });

  const translateIds = plan
    .filter((item) => item.kind === "translate")
    .map((item) => item.article.id);
  const cachedMap = await getCachedTranslations(translateIds, locale);

  const firstPass = await mapPool(plan, 10, async (item) => {
    if (item.kind === "native") {
      return prepareArticleForDisplay(item.article, locale, mode, { live: false });
    }
    if (item.kind === "passthrough") {
      if (primaryArticleLocale(locale) !== "cs" && looksLikeCzech(item.article.title)) {
        const hit = await fallbackTranslateFields({
          title: item.article.title,
          excerpt: item.article.excerpt,
          content: item.article.content,
          sourceLocale: item.article.locale ?? "cs",
          targetLocale: locale,
          mode: "card",
        });
        if (hit && !looksLikeCzech(hit.title)) {
          return attachEditorialDisplay(item.article, locale, {
            title: hit.title,
            excerpt:
              hit.excerpt && !looksLikeCzech(hit.excerpt)
                ? hit.excerpt
                : looksLikeCzech(item.article.excerpt)
                  ? hit.title
                  : item.article.excerpt,
            displayLocale: primaryArticleLocale(locale),
            translatedFrom: item.article.locale ?? null,
            translation_provider: hit.translation_provider,
            machine_translated: true,
            reviewed: false,
          });
        }
      }
      return attachEditorialDisplay(item.article, locale, {
        displayLocale: primaryArticleLocale(locale),
      });
    }
    const cached = cachedMap.get(item.article.id);
    if (cached?.title) {
      return attachEditorialDisplay(item.article, locale, {
        title: cached.title,
        excerpt:
          cached.excerpt && !looksLikeCzech(cached.excerpt)
            ? cached.excerpt
            : looksLikeCzech(item.article.excerpt)
              ? cached.title
              : item.article.excerpt,
        displayLocale: primaryArticleLocale(locale),
        translatedFrom: item.article.locale ?? null,
        translation_provider: cached.translation_provider,
        machine_translated: true,
        reviewed: cached.reviewed,
      });
    }
    return attachEditorialDisplay(item.article, locale, {
      displayLocale: primaryArticleLocale(locale),
    });
  });

  const missIndexes: number[] = [];
  firstPass.forEach((display, index) => {
    const czechLeak =
      primaryArticleLocale(locale) !== "cs" &&
      (looksLikeCzech(display.title) || looksLikeCzech(display.excerpt));
    if ((plan[index]?.kind === "translate" && !display.machine_translated) || czechLeak) {
      missIndexes.push(index);
    }
  });

  if (missIndexes.length === 0 || mode !== "card") {
    if (missIndexes.length && mode === "full") {
      const full = await mapPool(firstPass, 2, async (display, index) => {
        if (!missIndexes.includes(index)) return display;
        return prepareArticleForDisplay(plan[index]!.article, locale, mode, { live: true });
      });
      return finalizePreparedListing(full, locale);
    }
    return finalizePreparedListing(firstPass, locale);
  }

  const fill = mapPool(missIndexes, 8, async (index) => {
    const article = plan[index]!.article;
    const hit = await fallbackTranslateFields({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      sourceLocale: article.locale ?? "cs",
      targetLocale: locale,
      mode: "card",
    });
    if (!hit) {
      return { index, display: firstPass[index]! };
    }
    void saveCachedTranslation(article.id, locale, hit);
    return {
      index,
      display: attachEditorialDisplay(firstPass[index]!, locale, {
        title: hit.title,
        excerpt:
          hit.excerpt && !looksLikeCzech(hit.excerpt)
            ? hit.excerpt
            : looksLikeCzech(firstPass[index]!.excerpt)
              ? hit.title
              : firstPass[index]!.excerpt,
        displayLocale: primaryArticleLocale(locale),
        translatedFrom: article.locale ?? null,
        translation_provider: hit.translation_provider,
        machine_translated: true,
        reviewed: false,
      }),
    };
  });

  const filled = await fill;

  if (filled) {
    for (const row of filled) {
      firstPass[row.index] = row.display;
    }
  }

  return finalizePreparedListing(firstPass, locale);
}
