/**
 * Date labels + mix of fresh homepage cards with a few older resurfaced pieces.
 */
const RESURFACE_AFTER_MS = 14 * 86_400_000;

type DatedArticle = {
  id: string;
  published_at?: string | null;
  created_at?: string | null;
};

export function articleTimestampMs(article: DatedArticle): number {
  const iso = article.published_at ?? article.created_at;
  if (!iso) return 0;
  const ts = new Date(iso).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

export function formatArticleDateLabel(article: DatedArticle): {
  text: string;
  dateTime: string;
} | null {
  const iso = article.published_at ?? article.created_at;
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return {
    dateTime: date.toISOString(),
    text: date.toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };
}

export function selectResurfaceCandidates<T extends DatedArticle>(
  listable: T[],
  count: number
): T[] {
  if (count <= 0 || listable.length === 0) return [];
  const cutoff = Date.now() - RESURFACE_AFTER_MS;
  const sorted = [...listable].sort((a, b) => articleTimestampMs(b) - articleTimestampMs(a));
  const older = sorted.filter((article) => articleTimestampMs(article) > 0 && articleTimestampMs(article) < cutoff);
  const pool = older.length >= count ? older : [...sorted].reverse();
  const picked: T[] = [];
  const used = new Set<string>();
  for (const article of pool) {
    if (picked.length >= count) break;
    if (used.has(article.id)) continue;
    used.add(article.id);
    picked.push(article);
  }
  return picked;
}

export function mixFreshFeed<T extends DatedArticle>(
  listable: T[],
  resurface: T[],
  limit: number
): T[] {
  const newest = [...listable].sort((a, b) => articleTimestampMs(b) - articleTimestampMs(a));
  const result: T[] = [];
  const used = new Set<string>();
  let resurfaceIndex = 0;

  const take = (article: T | undefined) => {
    if (!article || result.length >= limit || used.has(article.id)) return;
    used.add(article.id);
    result.push(article);
  };

  for (const article of newest) {
    if (result.length >= limit) break;
    take(article);
    if (result.length >= limit) break;
    if (result.length % 3 === 0) {
      while (resurfaceIndex < resurface.length && used.has(resurface[resurfaceIndex]!.id)) {
        resurfaceIndex += 1;
      }
      take(resurface[resurfaceIndex]);
      resurfaceIndex += 1;
    }
  }

  return result.slice(0, limit);
}
