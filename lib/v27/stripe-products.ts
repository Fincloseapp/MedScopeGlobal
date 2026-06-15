/** Stripe product/price mapping for v27 monetization */
import {
  V27_SUBSCRIPTION_PLANS,
  V27_EXPERT_PDFS,
  V27_B2B_PACKAGES,
  parseSubscriptionProductId,
  type V27BillingInterval,
} from "@/lib/v27/config";

export type V27CheckoutKind = "subscription" | "expert_pdf" | "b2b_package";

export interface V27CheckoutItem {
  kind: V27CheckoutKind;
  productId: string;
  name: string;
  priceCzk: number;
  mode: "payment" | "subscription";
  billingInterval?: V27BillingInterval;
}

export function resolveV27CheckoutItem(kind: V27CheckoutKind, productId: string): V27CheckoutItem | null {
  if (kind === "subscription") {
    const parsed = parseSubscriptionProductId(productId);
    if (!parsed) return null;
    const plan = V27_SUBSCRIPTION_PLANS.find((p) => p.tier === parsed.tier);
    if (!plan) return null;
    const priceCzk = parsed.interval === "year" ? plan.annualCzk : plan.monthlyCzk;
    const suffix = parsed.interval === "year" ? " (roční)" : " (měsíční)";
    return {
      kind,
      productId,
      name: `${plan.name}${suffix}`,
      priceCzk,
      mode: "subscription",
      billingInterval: parsed.interval,
    };
  }
  if (kind === "expert_pdf") {
    const p = V27_EXPERT_PDFS.find((x) => x.id === productId);
    if (!p) return null;
    return { kind, productId, name: p.name, priceCzk: p.priceCzk, mode: "payment" };
  }
  if (kind === "b2b_package") {
    const p = V27_B2B_PACKAGES.find((x) => x.id === productId);
    if (!p) return null;
    return { kind, productId, name: p.name, priceCzk: p.priceCzk, mode: "payment" };
  }
  return null;
}
