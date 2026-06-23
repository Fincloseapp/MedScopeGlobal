import { normalizeTitleKey } from "@/lib/v19/dedup";
import type { ArticleWithRelations } from "@/types/database";

/** Keep the newest published row per normalized title (or slug fallback). */
export function dedupeArticlesByTitle<T extends ArticleWithRelations>(articles: T[]): T[] {
  const seen = new Map<string, T>();

  for (const article of articles) {
    const key =
      normalizeTitleKey(article.title) ||
      article.slug?.toLowerCase().trim() ||
      article.id;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, article);
      continue;
    }

    const existingTs = publishedTs(existing);
    const candidateTs = publishedTs(article);
    if (candidateTs >= existingTs) {
      seen.set(key, article);
    }
  }

  return [...seen.values()].sort((a, b) => publishedTs(b) - publishedTs(a));
}

function publishedTs(article: ArticleWithRelations): number {
  const raw = article.published_at ?? article.created_at;
  if (!raw) return 0;
  const ts = new Date(raw).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}
