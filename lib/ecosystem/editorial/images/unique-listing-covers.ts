/**
 * Keep neighbouring listing cards on distinct editorial covers.
 * Selection stays inside topic-safe curated pools and records AI editor review.
 */

import {
  classifyCoverTopic,
  coverIdentity,
  coverVisualFamily,
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
  const excluded = [...used].map((url) => coverVisualFamily(url)).filter(Boolean);
  const preferred = resolveArticleCoverUrl({
    title: article.title ?? "",
    slug: article.slug ?? undefined,
    excerpt: article.excerpt,
    category: article.categories?.name,
    publicTopic: article.public_topic,
    coverImageUrl: article.cover_image_url,
    preferCurated: true,
    keepAssignedCover: true,
  });
  const preferredFamily = coverVisualFamily(preferred);
  if (preferred && !excluded.includes(preferredFamily)) {
    return preferred;
  }

  for (const url of listingCoverOptionsForTopic(topic)) {
    const family = coverVisualFamily(url);
    if (excluded.includes(family)) continue;
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

  const blockedPaths = listingCoverOptionsForTopic(topic).filter((url) =>
    excluded.includes(coverVisualFamily(url))
  );
  if (preferred) blockedPaths.push(preferred);
  return pickCuratedCover(topic, articleSeed(article), blockedPaths);
}

/**
 * Assign distinct covers among articles shown together.
 * Same article id keeps one image if it appears twice (homepage desk overlap).
 * Uniqueness is a sliding window so far-apart cards may reuse a photo.
 */
export function assignUniqueListingCovers<T extends ListingCoverArticle>(
  articles: T[],
  options?: { neighbourWindow?: number }
): T[] {
  const windowSize = options?.neighbourWindow ?? 8;
  const recent: string[] = [];
  const coverById = new Map<string, string>();

  return articles.map((article) => {
    if (article.id && coverById.has(article.id)) {
      const reused = coverById.get(article.id)!;
      recent.push(coverVisualFamily(reused));
      if (recent.length > windowSize) recent.shift();
      return { ...article, cover_image_url: reused };
    }

    const next = pickUnusedListingCover(article, recent);
    const family = coverVisualFamily(next);
    if (family) {
      recent.push(family);
      if (recent.length > windowSize) recent.shift();
    }
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
