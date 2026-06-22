import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SITE } from "@/lib/config/site";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { resolveV27CheckoutItem, type V27CheckoutKind } from "@/lib/v27/stripe-products";
import { VIP_TRIAL_DAYS } from "@/lib/vip";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe není nakonfigurován. Nastavte STRIPE_SECRET_KEY na Vercel." },
      { status: 503 }
    );
  }

  let body: { kind?: V27CheckoutKind; productId?: string; userId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatný JSON" }, { status: 400 });
  }

  const { kind, productId, userId } = body;
  if (!kind || !productId) {
    return NextResponse.json({ error: "Chybí kind nebo productId" }, { status: 400 });
  }

  const item = resolveV27CheckoutItem(kind, productId);
  if (!item) {
    return NextResponse.json({ error: "Produkt nenalezen" }, { status: 404 });
  }

  const stripe = new Stripe(secret);
  const amount = Math.round(item.priceCzk * 100);
  const recurringInterval = item.billingInterval === "year" ? "year" : "month";

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: item.mode,
    success_url: `${SITE.url}/checkout/uspesne?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE.url}/predplatne?canceled=1`,
    payment_method_types: ["card"],
    metadata: {
      kind: `v27_${kind}`,
      product_id: productId,
      v27_checkout: "true",
      billing_interval: item.billingInterval ?? "month",
      ...(userId ? { user_id: userId } : {}),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "czk",
          unit_amount: amount,
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
            },
          },
        }
      : {}),
  };

  const session = await stripe.checkout.sessions.create(sessionParams);

  const admin = createServiceRoleClient();
  await admin.from("v27_orders").insert({
    stripe_session_id: session.id,
    kind,
    product_id: productId,
    amount_czk: item.priceCzk,
    status: "pending",
    user_id: userId ?? null,
    billing_interval: item.billingInterval ?? null,
    metadata: { billing_interval: item.billingInterval ?? "month" },
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
