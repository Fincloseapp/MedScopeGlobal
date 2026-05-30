import type { MetadataRoute } from "next";
import { articles, events } from "@/lib/data";
import { siteConfig } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap { const now = new Date(); return ["", "/articles", "/news", "/events", "/b2b", "/dashboard", "/contact", ...articles.map((article) => `/articles/${article.slug}`), ...events.map((event) => `/events/${event.slug}`)].map((path) => ({ url: `${siteConfig.url}${path}`, lastModified: now, changeFrequency: "weekly", priority: path === "" ? 1 : 0.7 })); }
