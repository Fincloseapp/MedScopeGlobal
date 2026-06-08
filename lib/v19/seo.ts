import type { V19ArticlePayload } from "@/lib/v19/types";

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.medscopeglobal.com";

export type V19SeoMeta = {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  jsonLd: Record<string, unknown>;
};

export function buildV19SeoMeta(
  article: V19ArticlePayload & { slug?: string },
  locale: string
): V19SeoMeta {
  const slug = article.slug ?? "";
  const canonicalUrl = slug ? `${SITE_ORIGIN}/article/${slug}` : `${SITE_ORIGIN}/odborne/briefy`;
  const keywords = [
    ...(article.keywords ?? []),
    ...(article.nzipTopicTags ?? []),
    ...(article.nzipCategoryTags ?? []),
    ...(article.nzipGlossaryTerms ?? []),
  ].filter(Boolean);
  const uniqueKeywords = keywords.length
    ? [...new Set(keywords)].slice(0, 20)
    : [article.specialtyLabel, article.topic, "MedScope", "zdravotnictví"].filter(Boolean);

  const metaTitle = article.title.slice(0, 60);
  const metaDescription = (article.summary ?? "").slice(0, 160);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: metaDescription,
    datePublished: article.date,
    inLanguage: locale,
    keywords: uniqueKeywords.join(", "),
    author: {
      "@type": "Organization",
      name: "MedScopeGlobal",
    },
    publisher: {
      "@type": "Organization",
      name: "MedScopeGlobal",
      url: SITE_ORIGIN,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    about: [
      { "@type": "MedicalSpecialty", name: article.specialtyLabel },
      ...(article.nzipTopicTags ?? []).map((t) => ({ "@type": "Thing", name: t })),
    ],
    citation: article.sourceUrl
      ? {
          "@type": "CreativeWork",
          name: article.sourceName,
          url: article.sourceUrl,
        }
      : undefined,
  };

  return { metaTitle, metaDescription, keywords: uniqueKeywords, canonicalUrl, jsonLd };
}
