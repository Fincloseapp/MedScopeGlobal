import {
  canAccessContent,
  type AccessLevelId,
} from "@/lib/config/access-levels";
import { shouldHideFromPublicListing } from "@/lib/editorial/article-quality-audit";

/**
 * Existing special-access flags only — do not invent a second paywall.
 *
 * Subscriptions stay voluntary. Public magazine is free + optional donate.
 * Only medical / doctor articles (vip_only or min_access_level=physician)
 * use the existing VIP + access_level gate.
 */
export type ArticleEligibilityFields = {
  vip_only?: boolean | null;
  min_access_level?: string | null;
  audience?: string | null;
  rubric_slug?: string | null;
  public_topic?: string | null;
  title?: string | null;
  slug?: string | null;
  content?: string | null;
  metadata?: unknown;
  source_name?: string | null;
};

export type ArticleLockDecision = {
  locked: boolean;
  specialAccess: boolean;
};

/** Medical / doctor articles already flagged for the existing eligibility gate. */
export function isSpecialAccessArticle(
  article: ArticleEligibilityFields
): boolean {
  if (article.vip_only === true) return true;
  return (article.min_access_level ?? "public") === "physician";
}

function isLayMagazineSurface(article: ArticleEligibilityFields): boolean {
  if (article.audience === "public") return true;
  if (article.public_topic) return true;
  const rubric = article.rubric_slug ?? "";
  if (
    rubric === "verejnost" ||
    rubric === "ai-lay-summary" ||
    rubric === "ai-patient-education"
  ) {
    return true;
  }
  return String(article.slug ?? "").startsWith("verejnost-");
}

/** Public magazine / osvěta — never a subscription gate. */
export function isPublicMagazineArticle(
  article: ArticleEligibilityFields
): boolean {
  if (isSpecialAccessArticle(article)) return false;
  return isLayMagazineSurface(article);
}

/**
 * Body lock uses the existing vip_only + min_access_level checks only.
 * Magazine pieces stay unlocked even if a reader is a guest.
 */
export function resolveArticleBodyLock(
  article: ArticleEligibilityFields,
  reader: { isVip: boolean; accessLevel: AccessLevelId | string }
): ArticleLockDecision {
  if (isPublicMagazineArticle(article) || !isSpecialAccessArticle(article)) {
    return { locked: false, specialAccess: false };
  }

  const minLevel = (article.min_access_level ?? "public") as AccessLevelId;
  const locked =
    (Boolean(article.vip_only) && !reader.isVip) ||
    !canAccessContent(reader.accessLevel, minLevel);

  return { locked, specialAccess: true };
}

/**
 * Detail pages must not 404 special-access medical articles.
 * Listing hide (vip_only / thin stubs) still applies to magazine hubs.
 */
export function shouldHideFromArticleDetail(
  article: ArticleEligibilityFields
): boolean {
  if (isSpecialAccessArticle(article)) return false;
  const metadata =
    article.metadata &&
    typeof article.metadata === "object" &&
    !Array.isArray(article.metadata)
      ? (article.metadata as Record<string, unknown>)
      : null;
  return shouldHideFromPublicListing({
    title: article.title ?? "",
    slug: article.slug ?? "",
    vip_only: Boolean(article.vip_only),
    content: article.content ?? "",
    metadata,
    rubric_slug: article.rubric_slug,
    source_name: article.source_name,
  });
}

/** Safe to link from a public magazine page (guest, no new paywall). */
export function isPublicMagazineRecommendable(
  article: ArticleEligibilityFields
): boolean {
  if (!isPublicMagazineArticle(article)) return false;
  return !shouldHideFromArticleDetail(article);
}
