import type { ExchangeAdFormat, ExchangePlan } from "@/lib/exchange/types";

/**
 * Subscription is the only Exchange revenue. No deal commission, no success fee.
 * Buyers send inquiries for free. Advertisers unlock contacts with Pro / Enterprise.
 */
export const EXCHANGE_COMMISSION = {
  contactFeePercent: 0,
  dealCommissionPercent: 0,
  successFeePercent: 0,
  successFeeOptIn: false,
  processesPayments: false,
  processesContracts: false,
  processesDelivery: false,
  processesInvoicing: false,
  revenueModel: "subscription_only",
} as const;

export const PLAN_COOKIE = "medscope_exchange_plan";

export type ExchangePlanSpec = {
  id: ExchangePlan;
  paid: boolean;
  listings: number | "unlimited";
  featuredSlots: number;
  autoTranslate: boolean;
  seeInquiries: boolean;
  seeContacts: boolean;
  canReply: boolean;
  stats: boolean;
  regionalTargeting: boolean;
  ads: boolean;
  microsite: boolean;
  apiImport: boolean;
  adCredits: number;
  premiumInquiries: boolean;
  monthlyCzk: number;
};

export const EXCHANGE_PLANS_SPEC: Record<ExchangePlan, ExchangePlanSpec> = {
  basic: {
    id: "basic",
    paid: false,
    listings: 5,
    featuredSlots: 0,
    autoTranslate: true,
    seeInquiries: true,
    seeContacts: false,
    canReply: false,
    stats: false,
    regionalTargeting: false,
    ads: false,
    microsite: false,
    apiImport: false,
    adCredits: 0,
    premiumInquiries: false,
    monthlyCzk: 0,
  },
  pro: {
    id: "pro",
    paid: true,
    listings: 25,
    featuredSlots: 2,
    autoTranslate: true,
    seeInquiries: true,
    seeContacts: true,
    canReply: true,
    stats: true,
    regionalTargeting: true,
    ads: true,
    microsite: false,
    apiImport: false,
    adCredits: 0,
    premiumInquiries: false,
    monthlyCzk: 14900,
  },
  enterprise: {
    id: "enterprise",
    paid: true,
    listings: "unlimited",
    featuredSlots: 8,
    autoTranslate: true,
    seeInquiries: true,
    seeContacts: true,
    canReply: true,
    stats: true,
    regionalTargeting: true,
    ads: true,
    microsite: true,
    apiImport: true,
    adCredits: 8,
    premiumInquiries: true,
    monthlyCzk: 0,
  },
};

export type ExchangeAdPackage = {
  id: ExchangeAdFormat;
  monthlyCzk: number;
  paidOnly: true;
};

export const EXCHANGE_AD_PACKAGES: Record<ExchangeAdFormat, ExchangeAdPackage> = {
  banner: { id: "banner", monthlyCzk: 5000, paidOnly: true },
  sponsored_article: { id: "sponsored_article", monthlyCzk: 15000, paidOnly: true },
  newsletter: { id: "newsletter", monthlyCzk: 3500, paidOnly: true },
};

export function planSpec(plan: ExchangePlan = "basic"): ExchangePlanSpec {
  return EXCHANGE_PLANS_SPEC[plan] ?? EXCHANGE_PLANS_SPEC.basic;
}

export function isPaidPlan(plan: ExchangePlan | string | null | undefined): boolean {
  return plan === "pro" || plan === "enterprise";
}

export function parseExchangePlan(value: unknown): ExchangePlan {
  if (value === "pro" || value === "enterprise" || value === "basic") return value;
  return "basic";
}

export function entitlementsFor(plan: ExchangePlan) {
  const spec = planSpec(plan);
  return {
    plan: spec.id,
    paid: spec.paid,
    canSeeInquiryList: spec.seeInquiries,
    canSeeContacts: spec.seeContacts,
    canReply: spec.canReply,
    canSeeStats: spec.stats,
    canFeature: spec.featuredSlots > 0,
    canBuyAds: spec.ads,
    canUseMicrosite: spec.microsite,
    canImportApi: spec.apiImport,
    canUseRegionalInbox: spec.regionalTargeting,
    premiumInquiries: spec.premiumInquiries,
  };
}
