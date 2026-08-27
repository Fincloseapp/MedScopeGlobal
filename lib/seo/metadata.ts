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

/** Open Graph alternateLocale list (underscore form) for all global locales. */
export const OG_ALTERNATE_LOCALES = HREFLANG_LOCALES.map((l) =>
  l.hreflang.replace("-", "_")
);

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
  const ogLocale = getOgLocale(params.locale);

  return {
    title: params.title,
    description: params.description,
    alternates: { canonical, languages },
    openGraph: {
      title: params.title,
      description: params.description,
      url: canonical,
      siteName: `${MAGAZINE.name} · ${SITE.name}`,
      locale: ogLocale,
      alternateLocale: OG_ALTERNATE_LOCALES.filter((alt) => alt !== ogLocale),
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

/** Locale-aware page metadata — reads `medscope_locale` when locale omitted. */
export async function buildLocalizedPageMetadata(
  params: Omit<Parameters<typeof buildPageMetadata>[0], "locale"> & {
    locale?: string;
  }
): Promise<Metadata> {
  // Dynamic import keeps next/headers out of static metadata consumers (e.g. root layout constants).
  const { getServerLocale } = await import("@/lib/i18n/server-locale");
  const locale = params.locale ?? (await getServerLocale());
  return buildPageMetadata({ ...params, locale });
}
