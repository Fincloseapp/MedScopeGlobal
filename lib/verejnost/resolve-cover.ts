import {
  pickCuratedCover,
  classifyCoverTopic,
  resolveArticleCoverUrl,
} from "@/lib/ecosystem/editorial/images/cover";

/**
 * Veřejnost listings — thin wrapper over the shared article cover resolver.
 * Prefer resolveArticleCoverUrl directly in new code.
 */
export function resolveVerejnostCoverUrl(article: {
  slug: string;
  title?: string | null;
  excerpt?: string | null;
  cover_image_url?: string | null;
  public_topic?: string | null;
}): string {
  return (
    resolveArticleCoverUrl({
      title: article.title ?? article.slug,
      slug: article.slug,
      excerpt: article.excerpt,
      publicTopic: article.public_topic,
      coverImageUrl: article.cover_image_url,
      preferCurated: true,
    }) ??
    pickCuratedCover(
      classifyCoverTopic({
        title: article.title ?? article.slug,
        slug: article.slug,
        excerpt: article.excerpt,
        publicTopic: article.public_topic,
      }),
      article.slug
    )
  );
}
