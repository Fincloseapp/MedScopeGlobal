import { MAGAZINE } from "@/lib/brand/magazine";
import { getSiteUrl } from "@/lib/config/site-url";
import { GLOBAL_LOCALES, type GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { publicArticleSlug } from "@/lib/editorial/clinician-anonymize";
import { localeArticleUrl } from "@/lib/seo/locale-sitemap";
import { createClient } from "@/lib/supabase/server";

const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function newsLanguage(locale: GlobalLocaleCode): string {
  const hreflang = GLOBAL_LOCALES.find((item) => item.code === locale)?.hreflang ?? locale;
  return hreflang.split("-")[0] ?? "en";
}

export function newsSitemapUrl(): string {
  return `${getSiteUrl()}/news-sitemap.xml`;
}

/** Google News sitemap — last 48 hours, every edition URL. */
export async function renderNewsSitemapXml(): Promise<string> {
  const base = getSiteUrl();
  const since = new Date(Date.now() - NEWS_WINDOW_MS).toISOString();
  let rows: { title: string; slug: string; publishedAt: string }[] = [];

  try {
    const supabase = await createClient();
    if (supabase) {
      const { data } = await supabase
        .from("articles")
        .select("title, slug, published_at")
        .eq("published", true)
        .gte("published_at", since)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(200);
      rows =
        data?.map((article) => ({
          title: String(article.title ?? ""),
          slug: publicArticleSlug(String(article.slug ?? "")),
          publishedAt: String(article.published_at ?? new Date().toISOString()),
        })) ?? [];
    }
  } catch (error) {
    console.error("news-sitemap fallback:", error);
  }

  const urls = rows.flatMap((article) =>
    GLOBAL_LOCALES.map((loc) => {
      const locUrl = localeArticleUrl(base, loc.code, article.slug);
      const lang = newsLanguage(loc.code);
      return `  <url>
    <loc>${escapeXml(locUrl)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(MAGAZINE.name)}</news:name>
        <news:language>${escapeXml(lang)}</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(new Date(article.publishedAt).toISOString())}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`;
    })
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join("\n")}
</urlset>`;
}
