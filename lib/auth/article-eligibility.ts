import {
  canAccessContent,
  type AccessLevelId,
} from "@/lib/config/access-levels";
import { editorialAccessFromFlags } from "@/lib/auth/editorial-access";
import { shouldHideFromPublicListing } from "@/lib/editorial/article-quality-audit";

/**
 * Two existing gates only:
 * - wire / Aktuality (`zpravy-*`, news rubric) stay fully open
 * - physician VIP (`vip_only` / min_access_level=physician) uses the VIP gate
 * - public magazine shows a teaser, then Redakce (25 Kč / €1 / $1, 14 days)
 *
 * `fully_open` on native desk seeds does not bypass the magazine teaser.
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

export type ArticleLockReader = {
  isVip: boolean;
  accessLevel: AccessLevelId | string;
  hasEditorialAccess?: boolean;
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

/**
 * Wire / Aktuality — full text without Redakce.
 * Uses slug, rubric and metadata.section only (not a title regex).
 */
export function isFreeNewsDeskArticle(article: ArticleEligibilityFields): boolean {
  const slug = String(article.slug ?? "").toLowerCase();
  if (slug.startsWith("zpravy-")) return true;
  const rubric = String(article.rubric_slug ?? "").toLowerCase();
  if (
    /novink|aktualni|aktuální|zprav|news|foreign/.test(rubric) ||
    rubric === "aktualni-zpravy"
  ) {
    return true;
  }
  const meta =
    article.metadata && typeof article.metadata === "object"
      ? (article.metadata as Record<string, unknown>)
      : null;
  const section = String(meta?.section ?? "").toLowerCase();
  return /news|zprav|aktual/.test(section);
}

/** Public magazine / osvěta — teaser + Redakce unless the reader already has access. */
export function isPublicMagazineArticle(
  article: ArticleEligibilityFields
): boolean {
  if (isSpecialAccessArticle(article)) return false;
  return isLayMagazineSurface(article);
}

function readerHasEditorialAccess(reader: ArticleLockReader): boolean {
  if (typeof reader.hasEditorialAccess === "boolean") return reader.hasEditorialAccess;
  return editorialAccessFromFlags({
    isVip: reader.isVip,
    accessLevel: reader.accessLevel,
  });
}

/**
 * News stays open. Physician VIP keeps the existing lock.
 * Public magazine locks for guests; Redakce / student / physician / VIP unlock.
 */
export function resolveArticleBodyLock(
  article: ArticleEligibilityFields,
  reader: ArticleLockReader
): ArticleLockDecision {
  if (isFreeNewsDeskArticle(article)) {
    return { locked: false, specialAccess: false };
  }

  if (isSpecialAccessArticle(article)) {
    const minLevel = (article.min_access_level ?? "public") as AccessLevelId;
    const locked =
      (Boolean(article.vip_only) && !reader.isVip) ||
      !canAccessContent(reader.accessLevel, minLevel);

    return { locked, specialAccess: true };
  }

  if (isPublicMagazineArticle(article)) {
    return { locked: !readerHasEditorialAccess(reader), specialAccess: false };
  }

  return { locked: false, specialAccess: false };
}

/**
 * Detail pages must not 404 special-access medical articles.
 * Listing hide (vip_only / thin stubs) still applies to magazine hubs.
 */
export function shouldHideFromArticleDetail(
  article: ArticleEligibilityFields
): boolean {
  if (isSpecialAccessArticle(article)) return false;
  return shouldHideFromPublicListing(article);
}

/** Safe to link from a public magazine listing (title + excerpt; body may still lock). */
export function isPublicMagazineRecommendable(
  article: ArticleEligibilityFields
): boolean {
  if (!isPublicMagazineArticle(article)) return false;
  return !shouldHideFromArticleDetail(article);
}
