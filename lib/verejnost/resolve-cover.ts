import { resolveArticleCoverUrl } from "@/lib/ecosystem/editorial/images/cover";

export function resolveVerejnostCoverUrl(article: {
  slug: string;
  cover_image_url?: string | null;
  public_topic?: string | null;
  title?: string | null;
  excerpt?: string | null;
  category?: string | null;
}): string {
  return (
    resolveArticleCoverUrl({
      title: article.title ?? "",
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      publicTopic: article.public_topic,
      coverImageUrl: article.cover_image_url,
      preferCurated: true,
    }) ?? "/assets/covers/research.webp"
  );
}
