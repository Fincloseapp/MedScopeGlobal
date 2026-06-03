import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const base =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://medscopeglobal.com");

const staticRoutes: MetadataRoute.Sitemap = [
  { url: base, changeFrequency: "daily", priority: 1 },
  { url: `${base}/articles`, changeFrequency: "hourly", priority: 0.9 },
  { url: `${base}/medicina`, changeFrequency: "weekly", priority: 0.85 },
  { url: `${base}/medicina/priprava`, changeFrequency: "weekly", priority: 0.85 },
  { url: `${base}/medicina/studium`, changeFrequency: "weekly", priority: 0.85 },
  { url: `${base}/pro-koho`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${base}/pro-koho/laik-student`, changeFrequency: "monthly", priority: 0.75 },
  { url: `${base}/pro-koho/lekar`, changeFrequency: "monthly", priority: 0.75 },
  { url: `${base}/pro-koho/vedec`, changeFrequency: "monthly", priority: 0.75 },
  { url: `${base}/access-levels`, changeFrequency: "monthly", priority: 0.7 },
  { url: `${base}/sections`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${base}/search`, changeFrequency: "weekly", priority: 0.5 },
  { url: `${base}/welcome`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${base}/vop`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${base}/gdpr`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${base}/cookies`, changeFrequency: "yearly", priority: 0.3 },
  { url: `${base}/pravo`, changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = await createClient();
    const [{ data: articles }, { data: categories }] = await Promise.all([
      supabase.from("articles").select("slug, published_at").eq("published", true).limit(5000),
      supabase.from("categories").select("slug").limit(200),
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

    return [...staticRoutes, ...categoryUrls, ...storyUrls];
  } catch (error) {
    console.error("sitemap fallback:", error);
    return staticRoutes;
  }
}
