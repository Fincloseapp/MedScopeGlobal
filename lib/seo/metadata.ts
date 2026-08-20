import { SITE } from "@/lib/config/site";
import type { Metadata } from "next";
import { ogImages } from "@/lib/seo/og";

export const HREFLANG_LOCALES = [
  { code: "cs", hreflang: "cs-CZ", label: "Čeština" },
  { code: "en", hreflang: "en-US", label: "English" },
  { code: "de", hreflang: "de-DE", label: "Deutsch" },
  { code: "pl", hreflang: "pl-PL", label: "Polski" },
  { code: "sk", hreflang: "sk-SK", label: "Slovenčina" },
] as const;

export function buildHreflangAlternates(path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const languages: Record<string, string> = {};
  for (const loc of HREFLANG_LOCALES) {
    languages[loc.hreflang] = `${SITE.url}${clean}?lang=${loc.code}`;
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
  const images = ogImages(params.title, params.image);

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
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: params.title,
      description: params.description,
      images: images.map((img) => img.url),
    },
  };
}
