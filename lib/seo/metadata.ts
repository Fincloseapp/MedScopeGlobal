import { SITE } from "@/lib/config/site";
import { getOgLocale, MAGAZINE } from "@/lib/brand/magazine";
import type { Metadata } from "next";
import { GLOBAL_LOCALES } from "@/lib/ecosystem/locales";
import { buildGlobalHreflang } from "@/lib/ecosystem/seo";

export const HREFLANG_LOCALES = GLOBAL_LOCALES.map((l) => ({
  code: l.code,
  hreflang: l.hreflang,
  label: l.label,
}));

/** Path-prefix hreflang alternates for all global locales + x-default. */
export function buildHreflangAlternates(path: string, locale?: string) {
  return buildGlobalHreflang(path, locale as Parameters<typeof buildGlobalHreflang>[1]);
}

export function buildPageMetadata(params: {
  title: string;
  description: string;
  path: string;
  image?: string;
  locale?: string;
}): Metadata {
  const { canonical, languages } = buildHreflangAlternates(params.path, params.locale);
  const ogImage = params.image ?? `${SITE.url}/og-default.png`;

  return {
    title: params.title,
    description: params.description,
    alternates: { canonical, languages },
    openGraph: {
      title: params.title,
      description: params.description,
      url: canonical,
      siteName: `${MAGAZINE.name} · ${SITE.name}`,
      locale: getOgLocale(params.locale),
      alternateLocale: HREFLANG_LOCALES.map((l) => l.hreflang.replace("-", "_")),
      images: [{ url: ogImage, width: 1200, height: 630, alt: params.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: params.title,
      description: params.description,
      images: [ogImage],
    },
  };
}
