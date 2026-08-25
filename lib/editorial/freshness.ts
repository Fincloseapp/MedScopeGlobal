import type { DisplayArticle } from "@/lib/articles/prepare-for-display";

export type ArticleDateLabel = {
  text: string;
  dateTime: string;
};

export function formatArticleDateLabel(
  articleOrIso?: DisplayArticle | string | null
): ArticleDateLabel | null {
  const iso =
    typeof articleOrIso === "string"
      ? articleOrIso
      : articleOrIso?.published_at ?? null;
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return {
    dateTime: d.toISOString(),
    text: d.toLocaleDateString("cs-CZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

/** Prefer newest items, then fill with resurface candidates. */
export function mixFreshFeed(
  fresh: DisplayArticle[],
  resurface: DisplayArticle[],
  limit: number
): DisplayArticle[] {
  const out: DisplayArticle[] = [];
  const seen = new Set<string>();
  for (const article of [...fresh, ...resurface]) {
    if (out.length >= limit) break;
    if (!article.id || seen.has(article.id)) continue;
    seen.add(article.id);
    out.push(article);
  }
  return out;
}

/** Older-but-still-active pieces to keep desks from looking empty. */
export function selectResurfaceCandidates(
  articles: DisplayArticle[],
  limit: number
): DisplayArticle[] {
  const sorted = [...articles].sort((a, b) => {
    const ta = new Date(a.published_at ?? 0).getTime();
    const tb = new Date(b.published_at ?? 0).getTime();
    return ta - tb;
  });
  return sorted.slice(0, Math.max(0, limit));
}
