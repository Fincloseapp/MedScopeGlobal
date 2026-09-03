import Link from "next/link";
import {
  isPublicMagazineRecommendable,
  isSpecialAccessArticle,
} from "@/lib/auth/article-eligibility";
import { mergeNativeDeskFeed, relatedNativeDeskArticles } from "@/lib/editorial/native-desk-articles";
import { createDataClient } from "@/lib/supabase/data";
import { getArticleChrome } from "@/lib/i18n/article-chrome";
import { looksLikeCzech } from "@/lib/i18n/czech-detect";
import { normalizeLocale } from "@/lib/i18n/config";
import { filterArticlesForLocale } from "@/lib/i18n/filter-articles-for-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { primaryArticleLocale } from "@/lib/i18n/article-locale";

type RecArticle = {
  slug: string;
  title: string;
  excerpt: string | null;
  locale?: string | null;
  vip_only?: boolean | null;
  min_access_level?: string | null;
  audience?: string | null;
  rubric_slug?: string | null;
  public_topic?: string | null;
};

export async function ContentRecommendations({
  locale = "cs",
  currentSlug,
  magazineOnly = true,
}: {
  locale?: string;
  currentSlug?: string;
  /** Public magazine pages only recommend free magazine pieces (no 404 / gate links). */
  magazineOnly?: boolean;
}) {
  const isCs = locale === "cs" || locale.startsWith("cs");
  const chrome = getArticleChrome(locale);
  const supabase = await createDataClient();

  let articles: RecArticle[] = [];
  let studies: { slug: string; title: string; abstract: string | null }[] = [];
  let diagnoses: { slug: string; name: string; description: string | null }[] = [];

  if (supabase) {
    const [articlesRes, studiesRes, diagnosesRes] = await Promise.all([
      supabase
        .from("articles")
        .select(
          "slug, title, excerpt, locale, vip_only, min_access_level, audience, rubric_slug, public_topic"
        )
        .eq("published", true)
        .neq("slug", currentSlug ?? "")
        .order("published_at", { ascending: false })
        .limit(24),
      supabase
        .from("studies")
        .select("slug, title, abstract")
        .eq("published", true)
        .order("published_date", { ascending: false })
        .limit(3),
      supabase
        .from("diagnoses")
        .select("slug, name, description")
        .eq("published", true)
        .limit(3),
    ]);
    articles = (articlesRes.data ?? []).filter((row) =>
      magazineOnly
        ? isPublicMagazineRecommendable(row)
        : isSpecialAccessArticle(row) || isPublicMagazineRecommendable(row)
    );
    studies = magazineOnly ? [] : studiesRes.data ?? [];
    diagnoses = magazineOnly ? [] : diagnosesRes.data ?? [];
  }

  if (!articles.length) {
    const native = relatedNativeDeskArticles(locale, { slug: currentSlug }, 4).map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      locale: a.locale,
    }));
    if (native.length) {
      articles = native;
    } else if (isCs) {
      const { getDemoMagazineArticles } = await import(
        "@/lib/verejnost/demo-magazine-articles"
      );
      articles = getDemoMagazineArticles()
        .filter((a) => a.slug !== currentSlug && !isSpecialAccessArticle(a))
        .slice(0, 4)
        .map((a) => ({ slug: a.slug, title: a.title, excerpt: a.excerpt, locale: a.locale }));
    }
  } else {
    const localized = filterArticlesForLocale(articles, locale, {
      minNative: 4,
      courtesyBorrow: 0,
      maxBorrow: 0,
    });
    articles = mergeNativeDeskFeed(localized, locale)
      .filter((a) => a.slug !== currentSlug)
      .slice(0, 4)
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        locale: a.locale,
      }));
  }

  if (!isCs && articles.length > 0 && primaryArticleLocale(normalizeLocale(locale)) !== "cs") {
    const nativeEnough = articles.filter((item) => !looksLikeCzech(item.title));
    if (nativeEnough.length >= 2) {
      articles = nativeEnough.slice(0, 4);
    } else {
      const { fallbackTranslateFields } = await import("@/lib/i18n/translate-fallback");
      const target = normalizeLocale(locale);
      articles = (
        await Promise.all(
          articles.map(async (item) => {
            if (!looksLikeCzech(item.title)) return item;
            const hit = await fallbackTranslateFields({
              title: item.title,
              excerpt: item.excerpt,
              sourceLocale: "cs",
              targetLocale: target,
              mode: "card",
            });
            if (!hit || looksLikeCzech(hit.title)) return null;
            return { ...item, title: hit.title, excerpt: hit.excerpt ?? item.excerpt };
          })
        )
      ).filter((row): row is RecArticle => Boolean(row));
    }
  }

  if (!articles.length && !studies.length && !diagnoses.length) return null;

  return (
    <section
      className="mt-12 space-y-8 rounded-2xl border bg-medical-light/50 p-6 dark:bg-muted/30"
      aria-label={chrome.recommended}
    >
      <h2 className="font-display text-xl font-semibold text-medical-navy dark:text-foreground">
        {chrome.recommended}
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        {articles.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {chrome.articlesLabel}
            </h3>
            <ul className="space-y-2 text-sm">
              {articles.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={localizePublicHref(`/article/${a.slug}`, locale)}
                    className="text-primary hover:underline"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {studies.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {isCs ? "Studie" : "Studies"}
            </h3>
            <ul className="space-y-2 text-sm">
              {studies.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={localizePublicHref(`/study/${s.slug}`, locale)}
                    className="text-primary hover:underline"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {diagnoses.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {isCs ? "Diagnózy" : "Diagnoses"}
            </h3>
            <ul className="space-y-2 text-sm">
              {diagnoses.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={localizePublicHref(`/diagnosis/${d.slug}`, locale)}
                    className="text-primary hover:underline"
                  >
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
