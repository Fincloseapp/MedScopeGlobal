type CoverInput = {
  title?: string | null;
  category?: string | null;
  excerpt?: string | null;
  coverUrl?: string | null;
  slug?: string | null;
  public_topic?: string | null;
};

const FALLBACK =
  "https://images.unsplash.com/photo-1584515930387-285e4804f4cb?w=1200&h=675&fit=crop&q=85&auto=format&fm=webp";

/** Prefer stored cover; fall back to topic illustration. */
export function resolveDisplayCover(input: CoverInput): string | null {
  const direct = input.coverUrl?.trim();
  if (direct) return direct;
  return resolveTopicFallbackCover(input);
}

export function resolveTopicFallbackCover(input: CoverInput): string | null {
  const seed = (input.slug || input.title || "cover")
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  return `${FALLBACK}&sig=${Math.abs(seed % 999)}`;
}
