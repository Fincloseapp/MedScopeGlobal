/**
 * Public listing quality gate for homepage news desks and /articles.
 * Conservative: hide unpublished, future-dated, VIP-only, and empty stubs.
 */
import { isArchivedArticle } from "@/lib/v20/content-rules";

type AuditArticle = {
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  published?: boolean | null;
  published_at?: string | null;
  created_at?: string | null;
  vip_only?: boolean | null;
  rubric_slug?: string | null;
  locale?: string | null;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function isFutureDated(iso: string | null | undefined, now: Date): boolean {
  if (!iso) return false;
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return false;
  return ts > now.getTime() + 60_000;
}

function isEmptyStub(article: AuditArticle): boolean {
  const title = article.title?.trim() ?? "";
  if (title.length < 8) return true;
  const excerpt = article.excerpt?.trim() ?? "";
  const body = stripHtml(article.content ?? "");
  return excerpt.length < 24 && body.length < 80;
}

export function shouldHideFromPublicListing(
  article: AuditArticle,
  now = new Date()
): boolean {
  if (!article.slug?.trim() || !article.title?.trim()) return true;
  if (article.published === false) return true;
  if (article.vip_only) return true;
  if (isFutureDated(article.published_at, now)) return true;
  if (isArchivedArticle(article)) return true;
  if (article.locale === "en") return true;
  if (isEmptyStub(article)) return true;
  return false;
}
