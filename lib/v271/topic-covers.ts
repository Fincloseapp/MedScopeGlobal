import {
  classifyCoverTopic,
  pickCuratedCover,
  resolveArticleCoverUrl,
} from "@/lib/ecosystem/editorial/images/cover";

type CoverInput = {
  title?: string | null;
  category?: string | null;
  excerpt?: string | null;
  coverUrl?: string | null;
  slug?: string | null;
  public_topic?: string | null;
};

/** Prefer topic-matched curated art; never return dead Unsplash leftovers. */
export function resolveDisplayCover(input: CoverInput): string | null {
  return resolveArticleCoverUrl({
    title: input.title ?? "MedScopeGlobal",
    slug: input.slug ?? undefined,
    excerpt: input.excerpt,
    category: input.category,
    publicTopic: input.public_topic,
    coverImageUrl: input.coverUrl,
    preferCurated: true,
  });
}

export function resolveTopicFallbackCover(input: CoverInput): string | null {
  const topic = classifyCoverTopic({
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    category: input.category,
    publicTopic: input.public_topic,
  });
  return pickCuratedCover(topic, input.slug || input.title || "cover");
}
