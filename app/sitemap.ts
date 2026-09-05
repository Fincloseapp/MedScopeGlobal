import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/config/site-url";
import { buildRootSitemapStaticEntries } from "@/lib/seo/root-sitemap";
import { buildLocalePath } from "@/lib/i18n/locale-path";

const base = getSiteUrl();

async function loadDynamicSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  if (!supabase) return [];
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

  return [...categoryUrls, ...academyUrls];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = buildRootSitemapStaticEntries(base);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const extra = await Promise.race([
      loadDynamicSitemapEntries(),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), 2_000);
      }),
    ]);
    if (!extra) return staticRoutes;
    return [...staticRoutes, ...extra];
  } catch (error) {
    console.error("sitemap fallback:", error);
    return staticRoutes;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
