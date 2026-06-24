import type { MetadataRoute } from "next";
import { footerSections, navItems, siteConfig } from "@/lib/site";

const extraPaths = [
  "/pro-koho/laik-student",
  "/pro-koho/lekar",
  "/pro-koho/vedec",
  "/medicina/priprava",
  "/medicina/studium"
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (siteConfig.url || "https://medscopeglobal.com").replace(/\/$/, "");
  const paths = new Set<string>([
    "/",
    ...navItems.map((item) => item.href),
    ...footerSections.flatMap((section) => section.links.map((link) => link.href)),
    ...extraPaths
  ]);

  return [...paths].map((path) => ({
    url: path === "/" ? base : `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7
  }));
}
