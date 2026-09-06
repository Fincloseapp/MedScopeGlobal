import { MAGAZINE } from "@/lib/brand/magazine";
import { MEDICAL_DISCLAIMER, type GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { localHealthHint } from "@/lib/editorial/locale-magazine-desks";
import {
  magazineCategoriesForLocale,
  type MagazineCategoryId,
} from "@/lib/editorial/magazine-category-copy";
import { looksLikeCzech } from "@/lib/i18n/czech-detect";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";
import { normalizeLocale } from "@/lib/i18n/config";
import { getNewsletterCopy } from "@/lib/i18n/newsletter-copy";
import { resolveGlobalLocale } from "@/lib/i18n/locale-path";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { attachSectionImages, heroNewsletterImage } from "@/lib/v23/newsletter/images";
import { newsletterHeadline } from "@/lib/v23/newsletter/title";
import type { V23NewsletterItem, V23NewsletterLayout } from "@/lib/v23/newsletter/types";
import type { V23NewsletterSources } from "@/lib/v23/newsletter/sources";

export type LocaleMagazineSources = V23NewsletterSources & {
  locale: GlobalLocaleCode;
  byCategory: Record<MagazineCategoryId, V23NewsletterItem[]>;
};

type ArticleRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  locale: string | null;
  public_topic: string | null;
  vip_only: boolean | null;
};

function articleMatchesLocale(articleLocale: string | null | undefined, locale: string): boolean {
  const article = (articleLocale ?? "").toLowerCase();
  const primary = primaryArticleLocale(normalizeLocale(locale));
  if (primary === "cs") return !article || article.startsWith("cs");
  if (primary === "pt-BR") return article.startsWith("pt-br") || article === "pt-br";
  if (primary === "pt") return article === "pt" || article.startsWith("pt-pt");
  return article.startsWith(primary.toLowerCase());
}

function toItem(title: string, summary: string, href: string): V23NewsletterItem {
  return { title: title.trim(), summary: summary.trim().slice(0, 280), href };
}

function usableOnLocale(title: string, summary: string, locale: string): boolean {
  if (resolveGlobalLocale(locale) === "cs") return true;
  return !looksLikeCzech(title) && !looksLikeCzech(summary);
}

export async function gatherLocaleMagazineSources(locale: string): Promise<LocaleMagazineSources> {
  const resolved = resolveGlobalLocale(locale);
  const empty: LocaleMagazineSources = {
    locale: resolved,
    studies: [],
    articles: [],
    legislation: [],
    digitalHealth: [],
    drugs: [],
    universities: [],
    pendingTopics: [],
    byCategory: {
      "zivotni-styl": [],
      nemoci: [],
      prevence: [],
      rozhovory: [],
      dlouhovekost: [],
    },
  };

  const admin = tryCreateServiceRoleClient();
  if (!admin) return empty;

  const { data, error } = await admin
    .from("articles")
    .select("slug, title, excerpt, locale, public_topic, vip_only, published")
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(80);

  if (error || !data?.length) return empty;

  const rows = (data as ArticleRow[]).filter((row) => {
    if (!row.slug || !row.title || row.vip_only) return false;
    if (!articleMatchesLocale(row.locale, resolved)) return false;
    const summary = row.excerpt ?? "";
    return usableOnLocale(row.title, summary, resolved);
  });

  const byCategory = { ...empty.byCategory };
  for (const row of rows) {
    const topic = (row.public_topic ?? "") as MagazineCategoryId;
    if (!(topic in byCategory)) continue;
    const item = toItem(row.title, row.excerpt ?? "", `/article/${row.slug}`);
    byCategory[topic].push(item);
  }

  const articles = rows.slice(0, 6).map((row) =>
    toItem(row.title, row.excerpt ?? "", `/article/${row.slug}`)
  );

  return {
    ...empty,
    articles,
    byCategory,
  };
}

export function buildLocaleMagazineLayout(
  sources: LocaleMagazineSources,
  issueDate: string,
  locale: string
): V23NewsletterLayout {
  const resolved = resolveGlobalLocale(locale);
  const copy = getNewsletterCopy(resolved);
  const categories = magazineCategoriesForLocale(resolved);
  const hint = localHealthHint(resolved);
  const disclaimer = MEDICAL_DISCLAIMER[resolved] ?? MEDICAL_DISCLAIMER.en;

  const sections = attachSectionImages(
    categories.map((cat) => {
      const live = (sources.byCategory[cat.id] ?? []).slice(0, 3);
      const items =
        live.length > 0
          ? live
          : [
              {
                title: cat.fallbackTitle,
                summary: cat.fallbackSummary,
                href: `/verejnost/clanky?topic=${cat.id}`,
              },
            ];
      return {
        id: cat.id,
        title: cat.title,
        intro: cat.intro,
        items,
      };
    }),
    issueDate
  );

  const recommended =
    sources.articles.slice(0, 3).length >= 1
      ? sources.articles.slice(0, 3)
      : sections.flatMap((sec) => sec.items.slice(0, 1)).slice(0, 3);

  return {
    version: "v23.2.0",
    locale: resolved,
    heroImageUrl: heroNewsletterImage(`${issueDate}-${resolved}`),
    heroImageAlt: `${MAGAZINE.name} · ${copy.hubTitle}`,
    headline: newsletterHeadline(issueDate, resolved),
    intro: `${copy.briefIntro} ${hint} ${disclaimer}`.trim(),
    sections,
    recommended,
    manualTopics: [],
    sourcesSnapshot: {
      studies: 0,
      articles: sources.articles.length,
      legislation: 0,
      digitalHealth: 0,
      drugs: 0,
      universities: 0,
      pendingTopics: 0,
    },
    generatedAt: new Date().toISOString(),
  };
}
