/** Auto-generate SEO metadata from article/content fields. */

const STOP_WORDS = new Set([
  "a", "an", "the", "v", "ve", "na", "pro", "je", "jsou", "by", "byl", "byla",
]);

export function generateSeoKeywords(
  title: string,
  excerpt?: string | null,
  max = 10
): string[] {
  const text = `${title} ${excerpt ?? ""}`.toLowerCase();
  const words = text
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

  const freq = new Map<string, number>();
  for (const w of words) {
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w);
}

export function generateSeoTitle(title: string, category?: string | null): string {
  const base = title.trim();
  if (!category) return base.slice(0, 60);
  const suffix = ` | ${category}`;
  return (base + suffix).slice(0, 60);
}

export function generateSeoExcerpt(
  content: string,
  maxLength = 160
): string {
  const plain = content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxLength) return plain;
  const cut = plain.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut) + "…";
}

export function suggestInternalLinks(
  keywords: string[],
  articles: { slug: string; title: string }[],
  max = 5
): { slug: string; title: string; score: number }[] {
  return articles
    .map((a) => {
      const titleLower = a.title.toLowerCase();
      const score = keywords.reduce(
        (s, kw) => s + (titleLower.includes(kw) ? 1 : 0),
        0
      );
      return { ...a, score };
    })
    .filter((a) => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max);
}
