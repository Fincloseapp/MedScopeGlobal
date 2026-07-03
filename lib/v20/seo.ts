import type { Metadata } from "next";
import { SITE } from "@/lib/config/site";
import { V20_UI_VERSION } from "@/lib/v20/version";

export function buildV20PageMetadata(opts: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const url = opts.path ? `${SITE.url}${opts.path}` : SITE.url;
  return {
    title: opts.title,
    description: opts.description.slice(0, 160),
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description.slice(0, 160),
      url,
      locale: "cs_CZ",
      siteName: "MedScopeGlobal",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description.slice(0, 160),
    },
    other: { "medscope-ui-version": V20_UI_VERSION },
  };
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
  author?: { "@type": "Organization"; name: string }
) {
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
    mainEntityOfPage: `${SITE.url}/article/${article.slug}`,
    image: article.image ?? `${SITE.url}/og-default.png`,
    articleSection: article.category ?? "Medicína",
    inLanguage: "cs-CZ",
  };
}
