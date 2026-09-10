import type { ExchangeAdFormat, ExchangePlan } from "@/lib/exchange/types";

/**
 * Contact introductions are always free.
 * Optional success-fee (5–12 %) is opt-in, self-reported, invoiced separately.
 * The marketplace never processes buyer↔seller payments, contracts, or delivery.
 */
export const EXCHANGE_COMMISSION = {
  contactFeePercent: 0,
  successFeeMinPercent: 5,
  successFeeMaxPercent: 12,
  successFeeOptIn: true,
  processesPayments: false,
  processesContracts: false,
  processesDelivery: false,
  processesInvoicing: false,
} as const;

export type ExchangePlanSpec = {
  id: ExchangePlan;
  listings: number | "unlimited";
  featuredSlots: number;
  autoTranslate: boolean;
  regionalTargeting: boolean;
  adsDiscountPercent: number;
  successFeeEligible: boolean;
  monthlyCzk: number;
};

export const EXCHANGE_PLANS_SPEC: Record<ExchangePlan, ExchangePlanSpec> = {
  basic: {
    id: "basic",
    listings: 5,
    featuredSlots: 0,
    autoTranslate: true,
    regionalTargeting: true,
    adsDiscountPercent: 0,
    successFeeEligible: false,
    monthlyCzk: 4900,
  },
  pro: {
    id: "pro",
    listings: 25,
    featuredSlots: 2,
    autoTranslate: true,
    regionalTargeting: true,
    adsDiscountPercent: 10,
    successFeeEligible: false,
    monthlyCzk: 14900,
  },
  enterprise: {
    id: "enterprise",
    listings: "unlimited",
    featuredSlots: 8,
    autoTranslate: true,
    regionalTargeting: true,
    adsDiscountPercent: 20,
    successFeeEligible: true,
    monthlyCzk: 0,
  },
};

export type ExchangeAdPackage = {
  id: ExchangeAdFormat;
  monthlyCzk: number;
};

export const EXCHANGE_AD_PACKAGES: Record<ExchangeAdFormat, ExchangeAdPackage> = {
  banner: { id: "banner", monthlyCzk: 5000 },
  sponsored_article: { id: "sponsored_article", monthlyCzk: 15000 },
  newsletter: { id: "newsletter", monthlyCzk: 3500 },
};

export function clampSuccessFeePercent(value: number): number {
  const n = Number.isFinite(value) ? value : EXCHANGE_COMMISSION.successFeeMinPercent;
  return Math.min(
    EXCHANGE_COMMISSION.successFeeMaxPercent,
    Math.max(EXCHANGE_COMMISSION.successFeeMinPercent, n)
  );
}
