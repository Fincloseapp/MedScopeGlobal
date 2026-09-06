import type { MetadataRoute } from "next";
import { GLOBAL_LOCALES, type GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { getSiteUrl } from "@/lib/config/site-url";
import { publicArticleSlug } from "@/lib/editorial/clinician-anonymize";
import { localeToPathSegment, localeToSitemapSlug, pathSegmentToLocale } from "@/lib/i18n/locale-path";
import { LONGEVITY_PROTOCOLS } from "@/lib/ecosystem/longevity-protocols";
import { createClient } from "@/lib/supabase/server";

export type LocaleSitemapEntry = MetadataRoute.Sitemap[number] & {
  alternates?: { languages: Record<string, string> };
};

function localePrefix(locale: GlobalLocaleCode): string {
  return `/${localeToPathSegment(locale)}`;
}

export function localeArticleUrl(
  base: string,
  locale: GlobalLocaleCode,
  slug: string
): string {
  return `${base}${localePrefix(locale)}/article/${publicArticleSlug(slug)}`;
}

function hreflangMapForPath(base: string, path: string): Record<string, string> {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const languages: Record<string, string> = {};
  for (const loc of GLOBAL_LOCALES) {
    const prefix = localePrefix(loc.code);
    languages[loc.hreflang] = `${base}${prefix}${clean === "/" ? "" : clean}`;
  }
  languages["x-default"] = `${base}/cs${clean === "/" ? "" : clean}`;
  return languages;
}

function staticRoutesForLocale(base: string, locale: GlobalLocaleCode): LocaleSitemapEntry[] {
  const prefix = localePrefix(locale);
  const routes = [
    { path: "/", changeFrequency: "daily" as const, priority: 0.95 },
    { path: "/articles", changeFrequency: "daily" as const, priority: 0.95 },
    { path: "/novinky", changeFrequency: "hourly" as const, priority: 0.9 },
    { path: "/verejnost/clanky", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/aplikace", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/mediflow", changeFrequency: "weekly" as const, priority: 0.85 },
    { path: "/ordizaznam", changeFrequency: "weekly" as const, priority: 0.85 },
    { path: "/vip/protokoly", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/predplatne", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/newsletter", changeFrequency: "weekly" as const, priority: 0.88 },
    { path: "/newsletter/posledni", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/newsletter/dekujeme", changeFrequency: "monthly" as const, priority: 0.4 },
    { path: "/o-nas", changeFrequency: "monthly" as const, priority: 0.5 },
    ...LONGEVITY_PROTOCOLS.map((protocol) => ({
      path: `/vip/protokoly/${protocol.slug}`,
      changeFrequency: "monthly" as const,
      priority: protocol.vipOnly ? 0.65 : 0.7,
    })),
  ];

  return routes.map((route) => ({
    url: `${base}${prefix}${route.path === "/" ? "" : route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: { languages: hreflangMapForPath(base, route.path) },
  }));
}

export async function buildLocaleSitemapEntries(
  locale: GlobalLocaleCode
): Promise<LocaleSitemapEntry[]> {
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
      .select("slug, published_at, updated_at")
      .eq("published", true)
      .limit(5000);

    const storyUrls: LocaleSitemapEntry[] =
      articles?.map((article) => {
        const publicSlug = publicArticleSlug(article.slug as string);
        return {
          url: `${base}${prefix}/article/${publicSlug}`,
          lastModified: article.updated_at
            ? new Date(article.updated_at as string)
            : article.published_at
              ? new Date(article.published_at as string)
              : new Date(),
          changeFrequency: "daily" as const,
          priority: 1,
          alternates: {
            languages: hreflangMapForPath(base, `/article/${publicSlug}`),
          },
        };
      }) ?? [];

    return [...staticRoutes, ...storyUrls];
  } catch (error) {
    console.error(`sitemap-${localeToSitemapSlug(locale)} fallback:`, error);
    return staticRoutes;
  }
}

export function sitemapEntriesToXml(entries: LocaleSitemapEntry[]): string {
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
      const links = entry.alternates?.languages
        ? Object.entries(entry.alternates.languages)
            .filter((pair): pair is [string, string] => typeof pair[1] === "string")
            .map(
              ([lang, href]) =>
                `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}" />`
            )
            .join("\n")
        : "";
      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>${lastmod}${changefreq}${priority}
${links}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
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

export function allLocaleFeedUrls(): string[] {
  const base = getSiteUrl();
  return GLOBAL_LOCALES.map(
    (loc) => `${base}/feed-${localeToSitemapSlug(loc.code)}.xml`
  );
}
