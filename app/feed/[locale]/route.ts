import { NextResponse } from "next/server";
import { publicArticleSlug } from "@/lib/editorial/clinician-anonymize";
import { GLOBAL_LOCALES } from "@/lib/ecosystem/locales";
import { rssItem } from "@/lib/ecosystem/seo";
import { getSiteUrl } from "@/lib/config/site-url";
import { MAGAZINE } from "@/lib/brand/magazine";
import { resolveSitemapLocale } from "@/lib/seo/locale-sitemap";
import { localeToPathSegment } from "@/lib/i18n/locale-path";
import { createClient } from "@/lib/supabase/server";
import { filterArticlesForLocale } from "@/lib/i18n/filter-articles-for-locale";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ locale: string }> };

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(_request: Request, { params }: Params) {
  const { locale: segment } = await params;
  const locale = resolveSitemapLocale(segment);
  if (!locale) {
    return new NextResponse("Not found", { status: 404 });
  }

  const base = getSiteUrl();
  const prefix = `/${localeToPathSegment(locale)}`;
  const hreflang = GLOBAL_LOCALES.find((item) => item.code === locale)?.hreflang ?? locale;
  const self = `${base}/feed-${localeToPathSegment(locale)}.xml`;

  let itemsXml = "";
  try {
    const supabase = await createClient();
    if (supabase) {
      const { data: articles } = await supabase
        .from("articles")
        .select("title, slug, excerpt, published_at, locale, metadata")
        .eq("published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(80);

      const filtered = filterArticlesForLocale(articles ?? [], locale);

      itemsXml =
        filtered
          .map((article) => {
            const item = rssItem({
              title: String(article.title ?? ""),
              slug: publicArticleSlug(article.slug as string),
              excerpt: (article.excerpt as string | null) ?? "",
              publishedAt: (article.published_at as string | null) ?? null,
              locale,
            });
            return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`;
          })
          .join("\n") ?? "";
    }
  } catch {
    itemsXml = "";
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${MAGAZINE.name} (${hreflang})`)}</title>
    <link>${escapeXml(`${base}${prefix}`)}</link>
    <description>${escapeXml(`${MAGAZINE.name} — health and longevity magazine`)}</description>
    <language>${escapeXml(hreflang)}</language>
    <atom:link href="${escapeXml(self)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
    },
  });
}
