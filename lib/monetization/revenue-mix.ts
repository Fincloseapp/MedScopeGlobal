import { type AffiliateProduct } from "@/lib/ecosystem/monetization";
export { applyAmazonAssociateTag } from "@/lib/ecosystem/monetization";
import {
  isSpecialAccessArticle,
  type ArticleEligibilityFields,
} from "@/lib/auth/article-eligibility";
import { pickAffiliateProductIds, pickAffiliateProducts } from "@/lib/monetization/affiliate-mix";

export type RevenueSurface = "public" | "physician" | "student";

export type RevenueArticle = ArticleEligibilityFields & {
  excerpt?: string | null;
  category?: string | null;
  med_track?: string | null;
};

export const LONGEVITY_MEDIA_KIT = [
  {
    id: "native-banner",
    priceCzk: 5000,
    interval: "month" as const,
  },
  {
    id: "sponsored-article",
    priceCzk: 15000,
    interval: "once" as const,
  },
  {
    id: "newsletter-mention",
    priceCzk: 3500,
    interval: "issue" as const,
  },
  {
    id: "cosmetics-hub",
    priceCzk: 22000,
    interval: "month" as const,
  },
] as const;

export function classifyRevenueSurface(article: RevenueArticle): RevenueSurface {
  const track = String(article.med_track ?? "").toLowerCase();
  if (track === "priprava" || track === "studium") return "student";

  if (isSpecialAccessArticle(article)) return "physician";

  const audience = String(article.audience ?? "").toLowerCase();
  if (
    audience === "physician" ||
    audience === "lekari" ||
    audience === "lékaři" ||
    audience === "doctor" ||
    audience === "doctors"
  ) {
    return "physician";
  }

  const rubric = String(article.rubric_slug ?? "").toLowerCase();
  if (
    rubric.includes("lekar") ||
    rubric.includes("lékař") ||
    rubric.includes("physician") ||
    rubric.includes("odborna") ||
    rubric.includes("odborná")
  ) {
    return "physician";
  }

  return "public";
}

export function shouldShowPublicSubscribeNudge(
  surface: RevenueSurface,
  isVip: boolean
): boolean {
  return surface === "public" && !isVip;
}

export function shouldShowAffiliate(surface: RevenueSurface): boolean {
  return surface === "public";
}

/** AdSense / display — public ViaLongeVita only; VIP and pro/student stay clean. */
export function shouldShowDisplayAds(surface: RevenueSurface, isVip: boolean): boolean {
  return surface === "public" && !isVip;
}

export function shouldShowOrdiZapisCta(surface: RevenueSurface): boolean {
  return surface === "physician";
}

export function shouldShowHousePartner(surface: RevenueSurface, isVip: boolean): boolean {
  return surface === "public" && !isVip;
}

/** Topic + rotating high-EPC filler — never dump the full catalogue. */
export function matchAffiliateProductIds(article: RevenueArticle): string[] {
  return pickAffiliateProductIds({ surface: "article", article });
}

export function matchAffiliateProducts(article: RevenueArticle): AffiliateProduct[] {
  return pickAffiliateProducts({ surface: "article", article });
}

