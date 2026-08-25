import type { MetadataRoute } from "next";
import { GLOBAL_LOCALES, type GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { getSiteUrl } from "@/lib/config/site-url";
import { localeToPathSegment, localeToSitemapSlug, pathSegmentToLocale } from "@/lib/i18n/locale-path";
import { resolveArticleLocales } from "@/lib/i18n/article-locale";
import type { LocaleCode } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { LONGEVITY_PROTOCOLS } from "@/lib/ecosystem/longevity-protocols";

function localePrefix(locale: GlobalLocaleCode): string {
  return `/${localeToPathSegment(locale)}`;
}

function staticRoutesForLocale(base: string, locale: GlobalLocaleCode): MetadataRoute.Sitemap {
  const prefix = localePrefix(locale);
  return [
    { url: `${base}${prefix}`, changeFrequency: "daily", priority: 0.95 },
    { url: `${base}${prefix}/articles`, changeFrequency: "daily", priority: 0.95 },
    { url: `${base}${prefix}/aplikace`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}${prefix}/mediflow`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}${prefix}/ordizaznam`, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}${prefix}/vip/protokoly`, changeFrequency: "weekly", priority: 0.8 },
    ...LONGEVITY_PROTOCOLS.map((protocol) => ({
      url: `${base}${prefix}/vip/protokoly/${protocol.slug}`,
      changeFrequency: "monthly" as const,
      priority: protocol.vipOnly ? 0.65 : 0.7,
    })),
    { url: `${base}${prefix}/o-nas`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}${prefix}/predplatne`, changeFrequency: "weekly", priority: 0.85 },
  ];
}

function articleMatchesLocale(
  articleLocale: string | null | undefined,
  locale: GlobalLocaleCode
): boolean {
  if (!articleLocale) return locale === "cs";
  const allowed = resolveArticleLocales(locale as LocaleCode);
  return allowed.includes(articleLocale);
}

export async function buildLocaleSitemapEntries(
  locale: GlobalLocaleCode
): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const prefix = localePrefix(locale);
  const staticRoutes = staticRoutesForLocale(base, locale);

  try {
    const supabase = await createClient();
    if (!supabase) {
      return staticRoutes;
    }
    const { data: articles } = await supabase
      .from("articles")
      .select("slug, published_at, locale")
      .eq("published", true)
      .limit(5000);

    const storyUrls: MetadataRoute.Sitemap =
      articles
        ?.filter((article) => articleMatchesLocale(article.locale as string | null, locale))
        .map((article) => ({
          url: `${base}${prefix}/article/${article.slug}`,
          lastModified: article.published_at
            ? new Date(article.published_at as string)
            : new Date(),
          changeFrequency: "daily" as const,
          priority: 1,
        })) ?? [];

    return [...staticRoutes, ...storyUrls];
  } catch (error) {
    console.error(`sitemap-${localeToSitemapSlug(locale)} fallback:`, error);
    return staticRoutes;
  }
}

export function sitemapEntriesToXml(entries: MetadataRoute.Sitemap): string {
  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastModified
        ? `<lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>`
        : "";
      const changefreq = entry.changeFrequency
        ? `<changefreq>${entry.changeFrequency}</changefreq>`
        : "";
      const priority =
        entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : "";
      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>${lastmod}${changefreq}${priority}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function resolveSitemapLocale(segment: string): GlobalLocaleCode | null {
  return pathSegmentToLocale(segment);
}

export function allLocaleSitemapUrls(): string[] {
  const base = getSiteUrl();
  return GLOBAL_LOCALES.map(
    (loc) => `${base}/sitemap-${localeToSitemapSlug(loc.code)}.xml`
  );
}
