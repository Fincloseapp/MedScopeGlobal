import { resolveArticleCoverUrl } from "@/lib/ecosystem/editorial/images/cover";

type CoverInput = {
  title?: string | null;
  category?: string | null;
  excerpt?: string | null;
  coverUrl?: string | null;
  slug?: string | null;
  public_topic?: string | null;
};

/** Prefer stored cover after editorial gate; else topic-safe fallback. */
export function resolveDisplayCover(input: CoverInput): string | null {
  return resolveArticleCoverUrl({
    title: input.title ?? "",
    slug: input.slug ?? undefined,
    excerpt: input.excerpt,
    category: input.category,
    publicTopic: input.public_topic,
    coverImageUrl: input.coverUrl,
    preferCurated: true,
    keepAssignedCover: true,
  });
}

export function resolveTopicFallbackCover(input: CoverInput): string | null {
  return resolveArticleCoverUrl({
    title: input.title ?? "",
    slug: input.slug ?? undefined,
    excerpt: input.excerpt,
    category: input.category,
    publicTopic: input.public_topic,
    coverImageUrl: null,
    preferCurated: true,
  });
}
