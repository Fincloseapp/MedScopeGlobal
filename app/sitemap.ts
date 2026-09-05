import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/config/site-url";
import { buildRootSitemapStaticEntries } from "@/lib/seo/root-sitemap";
import { buildLocalePath } from "@/lib/i18n/locale-path";

const base = getSiteUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = buildRootSitemapStaticEntries(base);
  try {
    const supabase = await createClient();
    const [{ data: categories }, { data: courses }] = await Promise.all([
      supabase.from("categories").select("slug").limit(200),
      supabase.from("courses").select("slug, updated_at").eq("status", "published").limit(500),
    ]);

    // Article URLs live in per-locale sitemaps (hreflang). Root must not emit CS-only /cs/article flood.

    const categoryUrls: MetadataRoute.Sitemap =
      categories?.map((category) => ({
        url: `${base}${buildLocalePath("cs", `/category/${category.slug}`)}`,
        changeFrequency: "weekly",
        priority: 0.55,
      })) ?? [];

    const academyUrls: MetadataRoute.Sitemap =
      courses?.map((course) => ({
        url: `${base}${buildLocalePath("cs", `/academy/courses/${course.slug}`)}`,
        lastModified: course.updated_at ? new Date(course.updated_at as string) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      })) ?? [];

    return [...staticRoutes, ...categoryUrls, ...academyUrls];
  } catch (error) {
    console.error("sitemap fallback:", error);
    return staticRoutes;
  }
}
