import type { DisplayArticle } from "@/lib/articles/prepare-for-display";

/** Soft quality gate for public magazine desks — keep permissive until audit ships. */
export function shouldHideFromPublicListing(
  article: Pick<DisplayArticle, "title" | "slug" | "vip_only">,
  _now = new Date()
): boolean {
  if (!article.slug?.trim() || !article.title?.trim()) return true;
  if (article.vip_only) return true;
  return false;
}
