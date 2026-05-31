import type { MetadataRoute } from "next";
import { articles, events } from "@/lib/data";
import { jobListings } from "@/lib/jobs";
import { siteConfig } from "@/lib/site";

const staticPaths = [
  "",
  "/articles",
  "/news",
  "/events",
  "/education",
  "/jobs",
  "/premium",
  "/institutions",
  "/knowledge",
  "/about",
  "/b2b",
  "/dashboard",
  "/contact",
  "/portal"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...staticPaths.map((path) => ({
      url: `${siteConfig.url}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7
    })),
    ...articles.map((article) => ({
      url: `${siteConfig.url}/articles/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: "weekly" as const,
      priority: 0.6
    })),
    ...events.map((event) => ({
      url: `${siteConfig.url}/events/${event.slug}`,
      lastModified: new Date(event.startsAt),
      changeFrequency: "weekly" as const,
      priority: 0.6
    })),
    ...jobListings.map((job) => ({
      url: `${siteConfig.url}/jobs/${job.slug}`,
      lastModified: new Date(job.postedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6
    }))
  ];
}
