import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/site-url";
import { allLocaleSitemapUrls } from "@/lib/seo/locale-sitemap";

const base = getSiteUrl();

/** robots.txt — Google, Seznam, Yandex, Baidu, Naver compatible. */
export default function robots(): MetadataRoute.Robots {
  const localeSitemaps = allLocaleSitemapUrls();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/_next/static/", "/ads.txt"],
        disallow: ["/admin", "/auth/callback", "/dashboard", "/api/"],
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
    ],
    sitemap: [`${base}/sitemap.xml`, ...localeSitemaps],
  };
}
