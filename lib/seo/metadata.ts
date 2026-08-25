import { SITE } from "@/lib/config/site";
import type { Metadata } from "next";
import { GLOBAL_LOCALES } from "@/lib/ecosystem/locales";

export const HREFLANG_LOCALES = GLOBAL_LOCALES.map((l) => ({
  code: l.code,
  hreflang: l.hreflang,
  label: l.label,
}));

export function buildHreflangAlternates(path: string, locale?: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const languages: Record<string, string> = {};
  for (const loc of GLOBAL_LOCALES) {
    languages[loc.hreflang] =
      loc.code === "cs"
        ? `${SITE.url}${clean}`
        : `${SITE.url}${clean}?lang=${encodeURIComponent(loc.code)}`;
  }
  languages["x-default"] = `${SITE.url}${clean}`;
  return { canonical: `${SITE.url}${clean}`, languages };
}

export function buildPageMetadata(params: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const { canonical, languages } = buildHreflangAlternates(params.path);
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
