import type { Metadata } from "next";
import { SITE } from "@/lib/config/site";
import { V20_UI_VERSION } from "@/lib/v20/version";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getOgLocale } from "@/lib/brand/magazine";
import { localeToPathSegment } from "@/lib/i18n/locale-path";

export function buildV20PageMetadata(opts: {
  title: string;
  description: string;
  path?: string;
  locale?: string;
}): Metadata {
  const path = opts.path ?? "/";
  const base = buildPageMetadata({
    title: opts.title,
    description: opts.description.slice(0, 160),
    path,
    locale: opts.locale,
  });
  return {
    ...base,
    other: { "medscope-ui-version": V20_UI_VERSION },
  };
}

/** Locale-aware V20 metadata — reads `medscope_locale` when locale omitted. */
export async function buildLocalizedV20PageMetadata(opts: {
  title: string;
  description: string;
  path?: string;
  locale?: string;
}): Promise<Metadata> {
  const { getServerLocale } = await import("@/lib/i18n/server-locale");
  const locale = opts.locale ?? (await getServerLocale());
  return buildV20PageMetadata({ ...opts, locale });
}

export function buildV20ArticleJsonLd(
  article: {
    title: string;
    slug: string;
    summary?: string;
    date?: string;
    category?: string;
    image?: string;
  },
  author?: { "@type": "Organization"; name: string },
  locale?: string
) {
  const og = getOgLocale(locale);
  const inLanguage = og.replace("_", "-");
  const localePrefix = locale ? `/${localeToPathSegment(locale)}` : "/cs";
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary ?? article.title,
    datePublished: article.date,
    dateModified: article.date,
    author: author ?? { "@type": "Organization", name: "MedScopeGlobal Editorial Board" },
    publisher: {
      "@type": "Organization",
      name: "MedScopeGlobal",
      url: SITE.url,
    },
    mainEntityOfPage: `${SITE.url}${localePrefix}/article/${article.slug}`,
    image: article.image ?? `${SITE.url}/og-default.png`,
    articleSection: article.category ?? "Medicína",
    inLanguage,
  };
}
