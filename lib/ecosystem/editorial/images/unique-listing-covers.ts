/**
 * Keep neighbouring listing cards on distinct editorial covers.
 * Selection stays inside topic-safe curated pools and records AI editor review.
 */

import {
  classifyCoverTopic,
  coverIdentity,
  listingCoverOptionsForTopic,
  pickCuratedCover,
  resolveArticleCoverUrl,
} from "./cover";
import { isDeniedEditorialImageUrl, validateVisualTopicMatch } from "./policy";

const LISTING_IMAGE_EDITOR_ID = "image-curator-global";

export type ListingCoverArticle = {
  id?: string;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  cover_image_url?: string | null;
  public_topic?: string | null;
  categories?: { name?: string | null } | null;
  metadata?: Record<string, unknown> | null;
};

function metaRecord(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return {};
}

function articleSeed(article: ListingCoverArticle): string {
  return article.slug || article.title || article.id || "cover";
}

export function pickUnusedListingCover(
  article: ListingCoverArticle,
  used: Iterable<string>
): string {
  const topic = classifyCoverTopic({
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    category: article.categories?.name,
    publicTopic: article.public_topic,
  });
  const excluded = [...used].map((url) => coverIdentity(url)).filter(Boolean);
  const preferred = resolveArticleCoverUrl({
    title: article.title ?? "",
    slug: article.slug ?? undefined,
    excerpt: article.excerpt,
    category: article.categories?.name,
    publicTopic: article.public_topic,
    coverImageUrl: article.cover_image_url,
    preferCurated: true,
  });
  const preferredKey = coverIdentity(preferred);
  if (preferred && !excluded.includes(preferredKey)) {
    return preferred;
  }

  for (const url of listingCoverOptionsForTopic(topic)) {
    const key = coverIdentity(url);
    if (excluded.includes(key)) continue;
    if (isDeniedEditorialImageUrl(url)) continue;
    const mismatch = validateVisualTopicMatch({
      url,
      articleTitle: article.title,
      articleSlug: article.slug,
      excerpt: article.excerpt,
      visualTopic: topic,
    });
    if (mismatch.length > 0) continue;
    return url;
  }

  return pickCuratedCover(topic, articleSeed(article), excluded);
}

/**
 * Assign distinct covers among articles shown together.
 * Same article id keeps one image if it appears twice (homepage desk overlap).
 */
export function assignUniqueListingCovers<T extends ListingCoverArticle>(articles: T[]): T[] {
  const used = new Set<string>();
  const coverById = new Map<string, string>();

  return articles.map((article) => {
    if (article.id && coverById.has(article.id)) {
      const reused = coverById.get(article.id)!;
      used.add(coverIdentity(reused));
      return { ...article, cover_image_url: reused };
    }

    const next = pickUnusedListingCover(article, used);
    const key = coverIdentity(next);
    if (key) used.add(key);
    if (article.id) coverById.set(article.id, next);

    return {
      ...article,
      cover_image_url: next,
      metadata: {
        ...metaRecord(article.metadata),
        editorial_image_review: "ai_editor",
        editorial_image_persona: LISTING_IMAGE_EDITOR_ID,
        editorial_image_unique_in_listing: true,
      },
    };
  });
}
