import { resolveVerejnostCoverUrl } from "@/lib/verejnost/resolve-cover";

type CoverInput = {
  title?: string | null;
  category?: string | null;
  excerpt?: string | null;
  coverUrl?: string | null;
  slug?: string | null;
};

/** Prefer stored cover; fall back to topic illustration. */
export function resolveDisplayCover(input: CoverInput): string | null {
  const direct = input.coverUrl?.trim();
  if (direct) return direct;
  return resolveTopicFallbackCover(input);
}

export function resolveTopicFallbackCover(input: CoverInput): string | null {
  try {
    return resolveVerejnostCoverUrl({
      title: input.title ?? "",
      slug: input.slug ?? "",
      cover_image_url: input.coverUrl ?? null,
      categories: input.category ? { name: input.category, slug: "", id: "" } : null,
      excerpt: input.excerpt ?? null,
    } as Parameters<typeof resolveVerejnostCoverUrl>[0]);
  } catch {
    return null;
  }
}
