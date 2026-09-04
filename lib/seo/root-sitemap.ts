/**
 * Root /sitemap.xml — static hubs only.
 * Articles live in per-locale sitemaps. Unprefixed /articles leaked Czech
 * chrome into every Search Console property.
 */

import type { MetadataRoute } from "next";
import { buildLocalePath } from "@/lib/i18n/locale-path";
import { LONGEVITY_PROTOCOLS } from "@/lib/ecosystem/longevity-protocols";

export const ROOT_SITEMAP_EDITIONS = [
  "cs",
  "de",
  "fr",
  "it",
  "es",
  "pt-BR",
  "en",
  "en-US",
  "en-UK",
] as const;

type StaticSpec = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

/** Magazine / public hubs — one URL per edition. */
const MAGAZINE_PATHS: StaticSpec[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/articles", changeFrequency: "hourly", priority: 0.95 },
  { path: "/vip/protokoly", changeFrequency: "weekly", priority: 0.92 },
  { path: "/mediflow", changeFrequency: "weekly", priority: 0.9 },
  { path: "/app/mediflow", changeFrequency: "weekly", priority: 0.88 },
  { path: "/aplikace", changeFrequency: "weekly", priority: 0.9 },
  { path: "/medipacient", changeFrequency: "weekly", priority: 0.88 },
  { path: "/medipacient/stahnout", changeFrequency: "monthly", priority: 0.75 },
  { path: "/app/pacient", changeFrequency: "weekly", priority: 0.85 },
  { path: "/lekari", changeFrequency: "weekly", priority: 0.82 },
  { path: "/lekari/dokumentace", changeFrequency: "weekly", priority: 0.85 },
  { path: "/app/dokumentace", changeFrequency: "weekly", priority: 0.82 },
  { path: "/ordizaznam", changeFrequency: "weekly", priority: 0.8 },
  { path: "/predplatne", changeFrequency: "weekly", priority: 0.9 },
  { path: "/newsletter", changeFrequency: "weekly", priority: 0.88 },
  { path: "/newsletter/posledni", changeFrequency: "weekly", priority: 0.8 },
  { path: "/newsletter/dekujeme", changeFrequency: "monthly", priority: 0.35 },
  { path: "/verejnost", changeFrequency: "daily", priority: 0.85 },
  { path: "/pro-koho", changeFrequency: "monthly", priority: 0.75 },
  { path: "/pro-koho/lekar", changeFrequency: "monthly", priority: 0.7 },
  { path: "/pro-koho/vedec", changeFrequency: "monthly", priority: 0.65 },
  { path: "/access-levels", changeFrequency: "monthly", priority: 0.65 },
  { path: "/sections", changeFrequency: "weekly", priority: 0.65 },
  { path: "/search", changeFrequency: "weekly", priority: 0.45 },
  { path: "/vop", changeFrequency: "yearly", priority: 0.3 },
  { path: "/gdpr", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
  { path: "/pravo", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/znacka", changeFrequency: "yearly", priority: 0.4 },
  { path: "/o-nas", changeFrequency: "monthly", priority: 0.5 },
  ...LONGEVITY_PROTOCOLS.map((protocol) => ({
    path: `/vip/protokoly/${protocol.slug}`,
    changeFrequency: "monthly" as const,
    priority: protocol.vipOnly ? 0.65 : 0.7,
  })),
];

/** Czech-only student / MeDiprep / academy surfaces. */
const CZECH_ONLY_PATHS: StaticSpec[] = [
  { path: "/dashboard", changeFrequency: "weekly", priority: 0.75 },
  { path: "/academy", changeFrequency: "weekly", priority: 0.72 },
  { path: "/academy/courses", changeFrequency: "monthly", priority: 0.35 },
  { path: "/mediprep", changeFrequency: "monthly", priority: 0.55 },
  { path: "/mediprep/stahnout", changeFrequency: "monthly", priority: 0.5 },
  { path: "/app/priprava", changeFrequency: "monthly", priority: 0.5 },
  { path: "/studenti", changeFrequency: "monthly", priority: 0.55 },
  { path: "/medicina", changeFrequency: "monthly", priority: 0.55 },
  { path: "/medicina/priprava", changeFrequency: "monthly", priority: 0.5 },
  { path: "/medicina/studium", changeFrequency: "monthly", priority: 0.55 },
  { path: "/pro-koho/laik-student", changeFrequency: "monthly", priority: 0.65 },
  { path: "/pravni-checklist", changeFrequency: "yearly", priority: 0.35 },
];

function abs(base: string, locale: string, path: string): string {
  return `${base.replace(/\/$/, "")}${buildLocalePath(locale, path)}`;
}

export function buildRootSitemapStaticEntries(base: string): MetadataRoute.Sitemap {
  const origin = base.replace(/\/$/, "");
  const out: MetadataRoute.Sitemap = [
    { url: origin, changeFrequency: "daily", priority: 1 },
  ];

  for (const locale of ROOT_SITEMAP_EDITIONS) {
    for (const spec of MAGAZINE_PATHS) {
      out.push({
        url: abs(origin, locale, spec.path),
        changeFrequency: spec.changeFrequency,
        priority: spec.priority,
      });
    }
  }

  for (const spec of CZECH_ONLY_PATHS) {
    out.push({
      url: abs(origin, "cs", spec.path),
      changeFrequency: spec.changeFrequency,
      priority: spec.priority,
    });
  }

  return out;
}
