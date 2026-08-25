import { SITE } from "@/lib/config/site";
import type { Metadata } from "next";
import { GLOBAL_LOCALES } from "@/lib/ecosystem/locales";

export const HREFLANG_LOCALES = GLOBAL_LOCALES.map((l) => ({
  code: l.code,
  hreflang: l.hreflang,
  label: l.label,
}));

function hreflangUrl(path: string, localeCode: string) {
  return localeCode === "cs"
    ? `${SITE.url}${path}`
    : `${SITE.url}${path}?lang=${encodeURIComponent(localeCode)}`;
}

export function buildHreflangAlternates(path: string, locale?: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const languages: Record<string, string> = {};
  for (const loc of GLOBAL_LOCALES) {
    languages[loc.hreflang] = hreflangUrl(clean, loc.code);
  }
  languages["x-default"] = `${SITE.url}${clean}`;
  const canonical =
    locale && locale !== "cs" ? hreflangUrl(clean, locale) : `${SITE.url}${clean}`;
  return { canonical, languages };
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
      siteName: SITE.name,
      locale: "cs_CZ",
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
