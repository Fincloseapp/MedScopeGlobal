import { renderNewsSitemapXml } from "@/lib/seo/news-sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  const xml = await renderNewsSitemapXml();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
