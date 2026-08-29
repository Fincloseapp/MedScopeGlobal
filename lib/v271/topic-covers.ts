import { resolveEditorialCover } from "@/lib/editorial/image-policy";

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
  return resolveEditorialCover({
    title: input.title,
    category: input.category,
    excerpt: input.excerpt,
    coverUrl: input.coverUrl,
    slug: input.slug,
    public_topic: input.public_topic,
  });
}

export function resolveTopicFallbackCover(input: CoverInput): string | null {
  return resolveEditorialCover({
    title: input.title,
    category: input.category,
    excerpt: input.excerpt,
    coverUrl: null,
    slug: input.slug,
    public_topic: input.public_topic,
  });
}
