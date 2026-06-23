import type { ArticleWithRelations } from "@/types/database";

import { V19_RUBRIC_SLUG } from "@/lib/v19/dedup";

/** Slugs promoted as fully open expert samples (Editor's pick). */
export const EDITORS_PICK_SLUGS: string[] = [
  "kardiologie-nemoci-srdce-a-cv",
  "neurologie-shrnut",
  "endokrinologie-zkladn-onemocnn-a-diagnostika",
  "diagnostika-revmatologickch-onemocnn-klov-kroky",
  "prevence-nemoc",
];

export function isEditorsPickArticle(article: Pick<ArticleWithRelations, "slug" | "quiz_json">): boolean {
  if (EDITORS_PICK_SLUGS.includes(article.slug)) return true;
  const meta = article.quiz_json as { editors_pick?: boolean } | null | undefined;
  return meta?.editors_pick === true;
}

/** Expert articles readable without subscription — Editor's pick or explicitly flagged. */
export function isFullyOpenExpertArticle(
  article: Pick<ArticleWithRelations, "slug" | "vip_only" | "quiz_json" | "rubric_slug">
): boolean {
  const meta = article.quiz_json as { fully_open?: boolean } | null | undefined;
  if (meta?.fully_open === true) return true;
  if (isEditorsPickArticle(article)) return true;
  if (!article.vip_only && article.rubric_slug === V19_RUBRIC_SLUG) return true;
  return false;
}
