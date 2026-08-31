import type Stripe from "stripe";
import { SITE } from "@/lib/config/site";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { createStripeClient, getStripeSecretKey } from "@/lib/stripe/client";
import { resolveV27CheckoutItem, type V27CheckoutKind } from "@/lib/v27/stripe-products";
import { convertCzkToCharge } from "@/lib/i18n/payment-currency";
import { VIP_TRIAL_DAYS } from "@/lib/vip";

export type V27CheckoutBody = {
  kind?: V27CheckoutKind;
  productId?: string;
  userId?: string;
  locale?: string | null;
  region?: string | null;
};

const STRIPE_LOCALES = new Set([
  "cs",
  "de",
  "en",
  "es",
  "fr",
  "it",
  "ja",
  "ko",
  "nl",
  "pl",
  "pt",
  "zh",
]);

function stripeCheckoutLocale(locale?: string | null): Stripe.Checkout.SessionCreateParams.Locale {
  const raw = (locale ?? "en").toLowerCase();
  if (raw.startsWith("zh")) return "zh";
  if (raw.startsWith("en")) return "en";
  const primary = raw.split("-")[0] ?? "en";
  if (STRIPE_LOCALES.has(primary)) return primary as Stripe.Checkout.SessionCreateParams.Locale;
  return "auto";
}

export async function createV27CheckoutSession(body: V27CheckoutBody) {
  const secret = getStripeSecretKey();
  if (!secret) {
    return {
      status: 503 as const,
      body: {
        error:
          "Stripe není nakonfigurován. Nastavte STRIPE_SECRET_KEY v Cloudflare Workers (Variables) nebo v .env.local.",
        enabled: false,
      },
    };
  }

  const { kind, productId, userId, locale, region } = body;
  if (!kind || !productId) {
    return { status: 400 as const, body: { error: "Chybí kind nebo productId" } };
  }

  const item = resolveV27CheckoutItem(kind, productId);
  if (!item) {
    return { status: 404 as const, body: { error: "Produkt nenalezen" } };
  }

  const stripe = createStripeClient(secret);
  const charge = convertCzkToCharge(item.priceCzk, locale, region);
  const recurringInterval = item.billingInterval === "year" ? "year" : "month";

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: item.mode,
    locale: stripeCheckoutLocale(locale),
    success_url: `${SITE.url}/checkout/uspesne?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE.url}/predplatne?canceled=1`,
    payment_method_types: ["card"],
    metadata: {
      kind: `v27_${kind}`,
      product_id: productId,
      v27_checkout: "true",
      billing_interval: item.billingInterval ?? "month",
      amount_czk: String(item.priceCzk),
      currency: charge.currency,
      unit_amount: String(charge.unitAmount),
      ...(userId ? { user_id: userId } : {}),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: charge.currency,
          unit_amount: charge.unitAmount,
          product_data: {
            name: item.name,
            description: `MedScopeGlobal — ${item.name} · ${VIP_TRIAL_DAYS}denní zkušební verze`,
          },
          ...(item.mode === "subscription"
            ? { recurring: { interval: recurringInterval } }
            : {}),
        },
      },
    ],
    ...(item.mode === "subscription"
      ? {
          subscription_data: {
            trial_period_days: VIP_TRIAL_DAYS,
            metadata: {
              v27_trial_days: String(VIP_TRIAL_DAYS),
              product_id: productId,
              ...(userId ? { user_id: userId } : {}),
            },
          },
        }
      : {}),
  };

  const session = await stripe.checkout.sessions.create(sessionParams);

  try {
    const admin = createServiceRoleClient();
    await admin.from("v27_orders").insert({
      stripe_session_id: session.id,
      kind,
      product_id: productId,
      amount_czk: item.priceCzk,
      status: "pending",
      user_id: userId ?? null,
      billing_interval: item.billingInterval ?? null,
      metadata: {
        billing_interval: item.billingInterval ?? "month",
        currency: charge.currency,
        unit_amount: charge.unitAmount,
      },
    });
  } catch {
    // Checkout still works if v27_orders table is not migrated yet.
  }

  return {
    status: 200 as const,
    body: { url: session.url, sessionId: session.id },
  };
}
