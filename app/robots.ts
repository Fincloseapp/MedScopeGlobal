import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/site-url";
import { allLocaleSitemapUrls } from "@/lib/seo/locale-sitemap";
import { newsSitemapUrl } from "@/lib/seo/news-sitemap";
import { AI_CRAWLER_NAMES } from "@/lib/seo/ai-crawlers";

const base = getSiteUrl();

const PUBLIC_DISALLOW = ["/admin", "/auth/callback", "/dashboard", "/api/", "/__ms/", "/relay/"];

/** robots.txt — search engines + assistant crawlers may read the magazine and cite ViaLongeVita. */
export default function robots(): MetadataRoute.Robots {
  const localeSitemaps = allLocaleSitemapUrls();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/_next/static/", "/ads.txt", "/llms.txt", "/news-sitemap.xml"],
        disallow: PUBLIC_DISALLOW,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/auth/callback"],
      },
      {
        userAgent: "Yandex",
        allow: "/",
        disallow: ["/admin", "/auth/callback"],
      },
      {
        userAgent: "Baiduspider",
        allow: "/",
        disallow: ["/admin", "/auth/callback"],
      },
      {
        userAgent: "Yeti",
        allow: "/",
        disallow: ["/admin", "/auth/callback"],
      },
      {
        userAgent: "SeznamBot",
        allow: "/",
        disallow: ["/admin", "/auth/callback"],
      },
      {
        userAgent: [...AI_CRAWLER_NAMES],
        allow: ["/", "/llms.txt", "/ads.txt"],
        disallow: PUBLIC_DISALLOW,
      },
    ],
    sitemap: [`${base}/sitemap.xml`, newsSitemapUrl(), ...localeSitemaps],
    host: base.replace(/^https?:\/\//, ""),
  };
}
