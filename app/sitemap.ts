import type { MetadataRoute } from "next";
import { LONGEVITY_PROTOCOLS } from "@/lib/ecosystem/longevity-protocols";
import { createClient } from "@/lib/supabase/server";

const base =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.CF_PAGES_URL
    ? process.env.CF_PAGES_URL.startsWith("http")
      ? process.env.CF_PAGES_URL
      : `https://${process.env.CF_PAGES_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://medscopeglobal.com");

const staticRoutes: MetadataRoute.Sitemap = [
  { url: base, changeFrequency: "daily", priority: 1 },
  { url: `${base}/articles`, changeFrequency: "hourly", priority: 0.95 },
  { url: `${base}/vip/protokoly`, changeFrequency: "weekly", priority: 0.92 },
  { url: `${base}/mediflow`, changeFrequency: "weekly", priority: 0.9 },
  { url: `${base}/app/mediflow`, changeFrequency: "weekly", priority: 0.88 },
  { url: `${base}/aplikace`, changeFrequency: "weekly", priority: 0.9 },
  { url: `${base}/medipacient`, changeFrequency: "weekly", priority: 0.88 },
  { url: `${base}/medipacient/stahnout`, changeFrequency: "monthly", priority: 0.75 },
  { url: `${base}/app/pacient`, changeFrequency: "weekly", priority: 0.85 },
  { url: `${base}/lekari/dokumentace`, changeFrequency: "weekly", priority: 0.85 },
  { url: `${base}/app/dokumentace`, changeFrequency: "weekly", priority: 0.82 },
  { url: `${base}/ordizaznam`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${base}/predplatne`, changeFrequency: "weekly", priority: 0.9 },
  { url: `${base}/verejnost`, changeFrequency: "daily", priority: 0.85 },
  { url: `${base}/lekari`, changeFrequency: "weekly", priority: 0.82 },
  { url: `${base}/dashboard`, changeFrequency: "weekly", priority: 0.75 },
  { url: `${base}/academy`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${base}/academy/courses`, changeFrequency: "weekly", priority: 0.78 },
  { url: `${base}/mediprep`, changeFrequency: "monthly", priority: 0.55 },
  { url: `${base}/mediprep/stahnout`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${base}/app/priprava`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${base}/studenti`, changeFrequency: "monthly", priority: 0.55 },
  { url: `${base}/medicina`, changeFrequency: "monthly", priority: 0.55 },
  { url: `${base}/medicina/priprava`, changeFrequency: "monthly", priority: 0.5 },
  { url: `${base}/medicina/studium`, changeFrequency: "monthly", priority: 0.55 },
  { url: `${base}/pro-koho`, changeFrequency: "monthly", priority: 0.75 },
  { url: `${base}/pro-koho/laik-student`, changeFrequency: "monthly", priority: 0.65 },
  { url: `${base}/pro-koho/lekar`, changeFrequency: "monthly", priority: 0.7 },
  { url: `${base}/pro-koho/vedec`, changeFrequency: "monthly", priority: 0.65 },
  { url: `${base}/access-levels`, changeFrequency: "monthly", priority: 0.65 },
  { url: `${base}/sections`, changeFrequency: "weekly", priority: 0.65 },
  { url: `${base}/search`, changeFrequency: "weekly", priority: 0.45 },
  { url: `${base}/vop`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${base}/gdpr`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${base}/cookies`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${base}/pravo`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${base}/znacka`, changeFrequency: "yearly", priority: 0.4 },
  { url: `${base}/pravni-checklist`, changeFrequency: "yearly", priority: 0.35 },
  { url: `${base}/o-nas`, changeFrequency: "monthly", priority: 0.5 },
  ...LONGEVITY_PROTOCOLS.map((protocol) => ({
    url: `${base}/vip/protokoly/${protocol.slug}`,
    changeFrequency: "monthly" as const,
    priority: protocol.vipOnly ? 0.65 : 0.7,
  })),
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = await createClient();
    const [{ data: articles }, { data: categories }, { data: courses }] = await Promise.all([
      supabase.from("articles").select("slug, published_at").eq("published", true).limit(5000),
      supabase.from("categories").select("slug").limit(200),
      supabase.from("courses").select("slug, updated_at").eq("status", "published").limit(500),
    ]);

    const storyUrls: MetadataRoute.Sitemap =
      articles?.map((article) => ({
        url: `${base}/article/${article.slug}`,
        lastModified: article.published_at
          ? new Date(article.published_at as string)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      })) ?? [];

    const categoryUrls: MetadataRoute.Sitemap =
      categories?.map((category) => ({
        url: `${base}/category/${category.slug}`,
        changeFrequency: "weekly",
        priority: 0.55,
      })) ?? [];

    const academyUrls: MetadataRoute.Sitemap =
      courses?.map((course) => ({
        url: `${base}/academy/courses/${course.slug}`,
        lastModified: course.updated_at ? new Date(course.updated_at as string) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      })) ?? [];

    return [...staticRoutes, ...categoryUrls, ...academyUrls, ...storyUrls];
  } catch (error) {
    console.error("sitemap fallback:", error);
    return staticRoutes;
  }
}
