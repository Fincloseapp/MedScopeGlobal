/**
 * v19.9 — automatické NZIP propojení článků
 */
import type { V19ArticlePayload, V19SourceTopic } from "@/lib/v19/types";
import {
  buildNzipDeepRegistries,
  findEducationLinks,
  findGlossaryMatches,
  type NzipRegistryObject,
} from "@/lib/v19/nzip-registries";
import { findNzipIndexEntry } from "@/lib/v19/nzip-index";

export type NzipEducationalLink = {
  label: string;
  url: string;
  type: string;
};

export type NzipArticleLinks = {
  topicTags: string[];
  categoryTags: string[];
  glossaryTerms: string[];
  educationalLinks: NzipEducationalLink[];
  registryRefs: string[];
};

function registryToEducationalLink(r: NzipRegistryObject): NzipEducationalLink {
  return { label: r.name, url: r.url, type: r.type };
}

/** Auto-link article payload to NZIP registries */
export function resolveNzipArticleLinks(
  article: Pick<
    V19ArticlePayload,
    | "keywords"
    | "nzipCategory"
    | "nzipRegistryId"
    | "nzipTopicTags"
    | "nzipCategoryTags"
    | "keyPoints"
    | "title"
    | "summary"
  >,
  topic?: V19SourceTopic
): NzipArticleLinks {
  const indexEntry = article.nzipRegistryId
    ? findNzipIndexEntry(article.nzipRegistryId)
    : topic?.isNzip
      ? findNzipIndexEntry(topic.id)
      : undefined;

  const topicTags = [
    ...(article.nzipTopicTags ?? []),
    ...(indexEntry?.topicTags ?? []),
    ...(topic?.nzipCategory ? [topic.nzipCategory] : []),
  ];
  const categoryTags = [
    ...(article.nzipCategoryTags ?? []),
    ...(indexEntry?.categoryTags ?? []),
    ...(article.nzipCategory ? [article.nzipCategory] : []),
  ];

  const blob = [article.title, article.summary, ...article.keyPoints, ...article.keywords].join(
    " "
  );
  const glossaryCandidates = article.keywords.filter((k) => k.length > 4);
  const glossaryFromRegistry = findGlossaryMatches(glossaryCandidates);
  const glossaryTerms = [
    ...new Set([
      ...glossaryFromRegistry.map((g) => g.name),
      ...glossaryCandidates.filter((k) => blob.toLowerCase().includes(k.toLowerCase())).slice(0, 6),
    ]),
  ].slice(0, 8);

  const educationPool = findEducationLinks(article.nzipCategory ?? topic?.nzipCategory);
  const preventionPool = buildNzipDeepRegistries().prevention.slice(0, 3);
  const educationalLinks = [
    ...educationPool.map(registryToEducationalLink),
    ...preventionPool.map(registryToEducationalLink),
  ].slice(0, 6);

  const registryRefs = [
    article.nzipRegistryId,
    indexEntry?.registryId,
    ...glossaryFromRegistry.map((g) => g.id),
    ...educationPool.map((e) => e.id),
  ].filter((x): x is string => Boolean(x));

  return {
    topicTags: [...new Set(topicTags)].slice(0, 10),
    categoryTags: [...new Set(categoryTags)].slice(0, 8),
    glossaryTerms,
    educationalLinks,
    registryRefs: [...new Set(registryRefs)],
  };
}

export function applyNzipLinksToArticle<T extends V19ArticlePayload>(
  article: T,
  topic?: V19SourceTopic
): T {
  if (!topic?.isNzip && !article.nzipRegistryId) return article;
  const links = resolveNzipArticleLinks(article, topic);
  return {
    ...article,
    nzipTopicTags: links.topicTags,
    nzipCategoryTags: links.categoryTags,
    nzipGlossaryTerms: links.glossaryTerms,
    nzipEducationalLinks: links.educationalLinks,
    nzipRegistryId: article.nzipRegistryId ?? topic?.id,
  };
}
