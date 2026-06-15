/** Stripe product/price mapping for v27 monetization */
import {
  V27_MINI_PRODUCTS,
  V27_SUBSCRIPTIONS,
  V27_EXPERT_PDFS,
  V27_B2B_PACKAGES,
} from "@/lib/v27/config";

export type V27CheckoutKind = "mini_product" | "subscription" | "expert_pdf" | "b2b_package";

export interface V27CheckoutItem {
  kind: V27CheckoutKind;
  productId: string;
  name: string;
  priceCzk: number;
  mode: "payment" | "subscription";
}

export function resolveV27CheckoutItem(kind: V27CheckoutKind, productId: string): V27CheckoutItem | null {
  if (kind === "mini_product") {
    const p = V27_MINI_PRODUCTS.find((x) => x.id === productId);
    if (!p) return null;
    return { kind, productId, name: p.name, priceCzk: p.priceCzk, mode: "payment" };
  }
  if (kind === "subscription") {
    const s = V27_SUBSCRIPTIONS[productId as keyof typeof V27_SUBSCRIPTIONS];
    if (!s) return null;
    return { kind, productId, name: s.name, priceCzk: s.priceCzk, mode: "subscription" };
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
