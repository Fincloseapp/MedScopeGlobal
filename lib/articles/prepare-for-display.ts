import { localizeCategories } from "@/lib/i18n/category-label";
import { normalizeLegacyCategory } from "@/lib/i18n/category-normalize";
import {
  matchesArticleLocale,
  primaryArticleLocale,
} from "@/lib/i18n/article-locale";
import type { LocaleCode } from "@/lib/i18n/config";
import { resolveArticleTranslation } from "@/lib/i18n/translate-article";
import type { ArticleWithRelations } from "@/types/database";
import { dedupeArticlesByTitle } from "@/lib/articles/dedupe";
import { enrichArticleBodyForDisplay } from "@/lib/articles/enrich-body";
import { polishCzechFields, isEnglishDominant } from "@/lib/v22/translate";

export type DisplayArticle = ArticleWithRelations & {
  displayLocale?: string;
  translatedFrom?: string | null;
  translation_provider?: string;
  machine_translated?: boolean;
  reviewed?: boolean;
};

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
  const normalized = normalizeLegacyCategory(article.categories, {
    title: article.title,
    excerpt: article.excerpt,
    public_topic: article.public_topic,
    keywords: Array.isArray(article.metadata?.keywords)
      ? (article.metadata.keywords as string[])
      : null,
  });
  const [cat] = await localizeCategories([normalized ?? article.categories], locale);
  return { ...article, categories: cat ?? article.categories };
}

export async function prepareArticleForDisplay(
  article: ArticleWithRelations,
  locale: LocaleCode,
  mode: "card" | "full" = "full"
): Promise<DisplayArticle> {
  let base = await applyCategoryLabels(article, locale);
  const target = primaryArticleLocale(locale);

  if (matchesArticleLocale(base.locale, locale)) {
    const polished =
      locale === "cs" && isEnglishDominant(base.title)
        ? polishCzechFields(base, locale)
        : base;
    const display = { ...polished, displayLocale: target };
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
    mode
  );

  if (!translated) {
    return {
      ...base,
      displayLocale: base.locale ?? undefined,
      translatedFrom: base.locale ?? "en",
    };
  }

  const content = translated.content ?? base.content;
  const enriched =
    mode === "full"
      ? enrichArticleBodyForDisplay({
          ...base,
          title: translated.title,
          excerpt: translated.excerpt ?? base.excerpt,
          content,
        })
      : content;

  return {
    ...base,
    title: translated.title,
    excerpt: translated.excerpt ?? base.excerpt,
    content: enriched,
    displayLocale: target,
    translatedFrom: base.locale ?? null,
    translation_provider: translated.translation_provider,
    machine_translated: translated.machine_translated,
    reviewed: translated.reviewed,
  };
}

export async function prepareArticlesForDisplay(
  articles: ArticleWithRelations[],
  locale: LocaleCode,
  options?: { mode?: "card" | "full"; maxTranslate?: number }
): Promise<DisplayArticle[]> {
  const sorted = sortByLocalePreference(dedupeArticlesByTitle(articles), locale);
  const mode = options?.mode ?? "card";
  const maxTranslate = options?.maxTranslate ?? 8;
  let translated = 0;

  const out: DisplayArticle[] = [];
  for (const article of sorted) {
    if (
      !matchesArticleLocale(article.locale, locale) &&
      translated < maxTranslate
    ) {
      out.push(await prepareArticleForDisplay(article, locale, mode));
      translated++;
    } else if (matchesArticleLocale(article.locale, locale)) {
      out.push(await prepareArticleForDisplay(article, locale, mode));
    } else {
      const withCat = await applyCategoryLabels(article, locale);
      out.push({
        ...withCat,
        displayLocale: withCat.locale ?? undefined,
        translatedFrom: withCat.locale ?? null,
      });
    }
  }
  return out;
}
