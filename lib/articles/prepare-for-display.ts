import { localizeCategories } from "@/lib/i18n/category-label";
import { normalizeLegacyCategory } from "@/lib/i18n/category-normalize";
import {
  matchesArticleLocale,
  primaryArticleLocale,
} from "@/lib/i18n/article-locale";
import type { LocaleCode } from "@/lib/i18n/config";
import { mapPool } from "@/lib/i18n/map-pool";
import { resolveArticleTranslation } from "@/lib/i18n/translate-article";
import type { ArticleWithRelations } from "@/types/database";
import { dedupeArticlesByTitle } from "@/lib/articles/dedupe";
import { enrichArticleBodyForDisplay } from "@/lib/articles/enrich-body";
import { polishCzechFields } from "@/lib/v22/translate";
import {
  assignEditorialUnits,
  publicEditorialByline,
  type EditorialAssignment,
  type EditorialLocale,
} from "@/lib/editorial/units";
import { resolveEditorialCover } from "@/lib/editorial/image-policy";
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
  const editorialLocale: EditorialLocale =
    primaryArticleLocale(locale) === "en" ? "en" : "cs";
  const assignment = assignEditorialUnits(article ?? {});
  // Czech magazine desk overrides must not clobber DE/FR/IT/… translations.
  const desk =
    primaryArticleLocale(locale) === "cs"
      ? applyMagazineDeskCopy({ ...article, ...extra })
      : { ...article, ...extra };
  const merged = { ...article, ...extra, ...desk };
  const cover_image_url = resolveEditorialCover({
    coverUrl: merged.cover_image_url,
    title: merged.title,
    excerpt: merged.excerpt,
    slug: merged.slug,
    public_topic: merged.public_topic,
    category: merged.categories?.name,
  });
  return {
    ...merged,
    cover_image_url,
    editorialAssignment: assignment,
    editorialPrimaryLabel: publicEditorialByline(editorialLocale),
  };
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
    if (mode === "full") {
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
      // English / mismatched locale: still polish so RSS CDATA bodies get a Czech teaser.
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
    return attachEditorialDisplay(base, locale, {
      displayLocale: base.locale ?? undefined,
      translatedFrom: base.locale ?? "en",
    });
  }

  const content = translated.content ?? base.content;
  const merged = {
    ...base,
    title: translated.title,
    excerpt: translated.excerpt ?? base.excerpt,
    content,
  };
  const polished = locale === "cs" ? polishCzechFields(merged, locale) : merged;
  const enriched =
    mode === "full"
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

export async function prepareArticlesForDisplay(
  articles: ArticleWithRelations[],
  locale: LocaleCode,
  options?: { mode?: "card" | "full"; maxTranslate?: number; maxLive?: number }
): Promise<DisplayArticle[]> {
  const sorted = sortByLocalePreference(dedupeArticlesByTitle(articles), locale);
  const mode = options?.mode ?? "card";
  const maxTranslate = options?.maxTranslate ?? 8;
  const maxLive = Math.min(options?.maxLive ?? 4, maxTranslate);

  let liveUsed = 0;
  let fallbackUsed = 0;
  const plan = sorted.map((article) => {
    const needsTranslation = !matchesArticleLocale(article.locale, locale);
    if (!needsTranslation) {
      return { article, kind: "native" as const, live: false };
    }
    if (fallbackUsed >= maxTranslate) {
      return { article, kind: "passthrough" as const, live: false };
    }
    fallbackUsed += 1;
    const live = liveUsed < maxLive;
    if (live) liveUsed += 1;
    return { article, kind: "translate" as const, live };
  });

  return mapPool(plan, 6, async (item) => {
    if (item.kind === "native" || item.kind === "translate") {
      return prepareArticleForDisplay(item.article, locale, mode, { live: item.live });
    }
    const withCat = await applyCategoryLabels(item.article, locale);
    if (locale === "cs") {
      const polished = polishCzechFields(withCat, "cs");
      return attachEditorialDisplay(withCat, locale, {
        title: polished.title,
        excerpt: polished.excerpt,
        content: polished.content,
        displayLocale: targetLocaleOrUndefined(withCat.locale),
        translatedFrom: withCat.locale ?? null,
      });
    }
    return attachEditorialDisplay(withCat, locale, {
      displayLocale: withCat.locale ?? undefined,
      translatedFrom: withCat.locale ?? null,
    });
  });
}

function targetLocaleOrUndefined(locale: string | null | undefined): string | undefined {
  return locale ?? undefined;
}
