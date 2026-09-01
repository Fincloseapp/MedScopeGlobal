import {
  AFFILIATE_PRODUCTS,
  type AffiliateProduct,
} from "@/lib/ecosystem/monetization";
export { applyAmazonAssociateTag } from "@/lib/ecosystem/monetization";
import {
  isSpecialAccessArticle,
  type ArticleEligibilityFields,
} from "@/lib/auth/article-eligibility";
import { isLongevityArticle } from "@/lib/v271/news-desks";

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

export function shouldShowOrdiZapisCta(surface: RevenueSurface): boolean {
  return surface === "physician";
}

export function shouldShowHousePartner(surface: RevenueSurface, isVip: boolean): boolean {
  return surface === "public" && !isVip;
}

function haystack(article: RevenueArticle): string {
  return [
    article.title,
    article.excerpt,
    article.slug,
    article.public_topic,
    article.category,
  ]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");
}

/** Max two products, matched to the article — never dump the full catalogue. */
export function matchAffiliateProductIds(article: RevenueArticle): string[] {
  const text = haystack(article);
  const ids: string[] = [];

  if (/spán|spanek|sleep|insomni|nespav|hrv|oura|whoop|circadian/.test(text)) {
    ids.push("sleep-tracker");
  }
  if (/magnes|hořčí|horcik|glycinát|glycinat/.test(text)) {
    ids.push("magnesium-glycinate");
  }
  if (/omega|rybí tuk|rybi tuk|srdc|lipid|cholesterol|epa|dha/.test(text)) {
    ids.push("omega-3-test");
  }
  if (/vitamin d|vitamín d|d3\b|k2\b|kostí|kosti|imunit|osteopor/.test(text)) {
    ids.push("vitamin-d3-k2");
  }

  const unique = [...new Set(ids)];
  if (unique.length >= 2) return unique.slice(0, 2);
  if (unique.length === 1) {
    const fallback = unique[0] === "sleep-tracker" ? "magnesium-glycinate" : "sleep-tracker";
    return [...unique, fallback];
  }

  if (
    isLongevityArticle({
      title: article.title,
      excerpt: article.excerpt,
      slug: article.slug,
      public_topic: article.public_topic,
    })
  ) {
    return ["magnesium-glycinate", "vitamin-d3-k2"];
  }

  return ["magnesium-glycinate", "sleep-tracker"];
}

export function matchAffiliateProducts(article: RevenueArticle): AffiliateProduct[] {
  const ids = new Set(matchAffiliateProductIds(article));
  return AFFILIATE_PRODUCTS.filter((product) => ids.has(product.id));
}

