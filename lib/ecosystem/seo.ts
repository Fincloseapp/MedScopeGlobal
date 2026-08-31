/** Multi-engine SEO configuration — Google, Yandex, Baidu, Naver, Seznam */

import { SITE } from "@/lib/config/site";
import { MAGAZINE } from "@/lib/brand/magazine";
import { publicArticleSlug } from "@/lib/editorial/clinician-anonymize";
import { GLOBAL_LOCALES, type GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { localeToPathSegment } from "@/lib/i18n/locale-path";

export type SearchEngine = "google" | "yandex" | "baidu" | "naver" | "seznam";

export const SEARCH_ENGINE_CONFIG: Record<SearchEngine, {
  verificationMeta?: string;
  sitemapPing?: string;
  botUserAgent: string;
}> = {
  google: {
    verificationMeta: "google-site-verification",
    sitemapPing: "https://www.google.com/ping?sitemap=",
    botUserAgent: "Googlebot",
  },
  yandex: {
    verificationMeta: "yandex-verification",
    sitemapPing: "https://webmaster.yandex.com/ping?sitemap=",
    botUserAgent: "YandexBot",
  },
  baidu: {
    verificationMeta: "baidu-site-verification",
    sitemapPing: undefined,
    botUserAgent: "Baiduspider",
  },
  naver: {
    verificationMeta: "naver-site-verification",
    sitemapPing: undefined,
    botUserAgent: "Yeti",
  },
  seznam: {
    verificationMeta: undefined,
    sitemapPing: undefined,
    botUserAgent: "SeznamBot",
  },
};

/** Build path-based hreflang alternates (/{locale}/… prefix for every locale). */
export function buildGlobalHreflang(path: string, locale?: GlobalLocaleCode) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const languages: Record<string, string> = {};

  for (const loc of GLOBAL_LOCALES) {
    const prefix = `/${localeToPathSegment(loc.code)}`;
    languages[loc.hreflang] = `${SITE.url}${prefix}${clean === "/" ? "" : clean}`;
  }
  languages["x-default"] = `${SITE.url}/cs${clean === "/" ? "" : clean}`;

  const canonicalPrefix = locale ? `/${localeToPathSegment(locale)}` : "/cs";
  return {
    canonical: `${SITE.url}${canonicalPrefix}${clean === "/" ? "" : clean}`,
    languages,
  };
}

/** JSON-LD for multi-engine structured data */
export function articleJsonLdGlobal(article: {
  title: string;
  excerpt?: string | null;
  slug: string;
  locale?: string;
  publishedAt?: string | null;
  authorName?: string | null;
  coverImage?: string | null;
}) {
  const localePrefix = article.locale
    ? `/${localeToPathSegment(article.locale)}`
    : "/cs";
  const slug = publicArticleSlug(article.slug);
  const inLanguage =
    GLOBAL_LOCALES.find((item) => item.code === article.locale)?.hreflang ??
    article.locale ??
    "cs-CZ";
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    inLanguage,
    isAccessibleForFree: true,
    author: { "@type": "Person", name: article.authorName ?? SITE.name },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: MAGAZINE.name,
      url: SITE.url,
    },
    datePublished: article.publishedAt,
    mainEntityOfPage: `${SITE.url}${localePrefix}/article/${slug}`,
    url: `${SITE.url}${localePrefix}/article/${slug}`,
    image: article.coverImage ?? `${SITE.url}/og-default.png`,
    medicalAudience: {
      "@type": "MedicalAudience",
      audienceType: "Patient",
    },
    lastReviewed: article.publishedAt,
    disclaimer: "Content is not medical diagnosis or treatment advice.",
  };
}

export function longevityProtocolJsonLd(protocol: {
  title: string;
  description: string;
  slug: string;
  locale?: string;
}) {
  const localePrefix = protocol.locale
    ? `/${localeToPathSegment(protocol.locale)}`
    : "/cs";
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: protocol.title,
    description: protocol.description,
    url: `${SITE.url}${localePrefix}/vip/protokoly/${protocol.slug}`,
    step: [],
    totalTime: "P4W",
  };
}

export function softwareApplicationJsonLd(app: {
  name: string;
  description: string;
  url: string;
  price?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: app.name,
    description: app.description,
    url: app.url,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web, iOS, Android",
    offers: app.price
      ? { "@type": "Offer", price: app.price, priceCurrency: "USD" }
      : undefined,
  };
}

/** RSS feed item builder */
export function rssItem(article: {
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  locale?: string;
}) {
  const localePrefix = article.locale
    ? `/${localeToPathSegment(article.locale)}`
    : "/cs";
  return {
    title: article.title,
    link: `${SITE.url}${localePrefix}/article/${article.slug}`,
    description: article.excerpt ?? "",
    pubDate: article.publishedAt ?? new Date().toISOString(),
    guid: `${SITE.url}${localePrefix}/article/${article.slug}`,
  };
}

/** Safe SEO keywords — no medical claims */
export function safeKeywords(locale: GlobalLocaleCode, topic: string): string[] {
  const base: Record<string, string[]> = {
    cs: ["zdraví", "wellness", "prevence", "longevity", "životní styl"],
    "en-US": ["health", "wellness", "prevention", "longevity", "lifestyle", "biohacking"],
    en: ["health", "wellness", "prevention", "longevity", "lifestyle"],
    ru: ["здоровье", "wellness", "профилактика", "долголетие"],
    "zh-CN": ["健康", "养生", "预防", "长寿"],
    ko: ["건강", "웰니스", "예방", "장수"],
    ja: ["健康", "ウェルネス", "予防", "長寿"],
  };
  const keywords = base[locale] ?? base.en;
  return [...keywords, topic].filter(Boolean);
}
