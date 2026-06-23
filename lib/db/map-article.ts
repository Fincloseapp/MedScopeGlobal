import type { Article, ArticleWithRelations } from "@/types/database";

/** Maps DB row (legacy or new schema) to app Article shape */
export function mapArticleRow<T extends Record<string, unknown>>(row: T): T & Article {
  const r = row as T & Partial<Article> & {
    summary?: string | null;
    cover_image?: string | null;
    image_url?: string | null;
  };

  return {
    ...r,
    excerpt: r.excerpt ?? r.summary ?? null,
    cover_image_url:
      r.cover_image_url ?? r.cover_image ?? r.image_url ?? null,
    vip_only: r.vip_only ?? false,
    updated_at: (r.updated_at as string | null) ?? null,
    min_access_level: (r.min_access_level as Article["min_access_level"]) ?? "public",
    locale: (r.locale as string) ?? "cs",
    rubric_slug: (r.rubric_slug as string | null) ?? null,
  } as T & Article;
}

export function mapArticleList(
  rows: Record<string, unknown>[] | null
): ArticleWithRelations[] {
  return (rows ?? []).map((r) =>
    mapArticleRow(r) as ArticleWithRelations
  );
}
