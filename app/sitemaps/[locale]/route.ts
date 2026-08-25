import { NextResponse } from "next/server";
import {
  buildLocaleSitemapEntries,
  resolveSitemapLocale,
  sitemapEntriesToXml,
} from "@/lib/seo/locale-sitemap";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ locale: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { locale: segment } = await params;
  const locale = resolveSitemapLocale(segment);

  if (!locale) {
    return new NextResponse("Not found", { status: 404 });
  }

  const entries = await buildLocaleSitemapEntries(locale);
  const xml = sitemapEntriesToXml(entries);

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
