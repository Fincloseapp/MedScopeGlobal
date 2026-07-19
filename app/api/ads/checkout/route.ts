import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SITE } from "@/lib/config/site";
import { createServiceRoleClient } from "@/lib/supabase/service";

/**
 * Stripe Checkout for an approved ads_request.
 * Used by buildPaymentUrl() after admin approval (or direct pay if already approved).
 */
export async function GET(request: Request) {
  const requestId = new URL(request.url).searchParams.get("request_id");
  if (!requestId) {
    return NextResponse.json({ error: "Missing request_id" }, { status: 400 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Stripe není nakonfigurován." },
      { status: 503 }
    );
  }

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { data: req, error } = await admin
    .from("ads_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle();

  if (error || !req) {
    return NextResponse.json({ error: "Žádost nenalezena." }, { status: 404 });
  }

  const status = String(req.status ?? "");
  if (!["approved", "pending", "active"].includes(status)) {
    return NextResponse.json(
      { error: "Žádost není ve stavu pro platbu." },
      { status: 409 }
    );
  }

  if (status === "active") {
    return NextResponse.redirect(`${SITE.url}/inzerce?already=1`);
  }

  // Reuse existing open session URL when present
  if (req.stripe_payment_link && status === "approved") {
    return NextResponse.redirect(req.stripe_payment_link as string);
  }

  const amount = Math.round(Number(req.price ?? 0) * 100);
  if (amount <= 0) {
    return NextResponse.json(
      { error: "Cena není nastavena — kontaktujte info@medscopeglobal.com." },
      { status: 400 }
    );
  }

  const stripe = new Stripe(stripeKey);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${SITE.url}/inzerce/formular?paid=1`,
    cancel_url: `${SITE.url}/inzerce/formular?paid=0`,
    customer_email: req.email ?? undefined,
    metadata: { ads_request_id: req.id, kind: "ad_campaign" },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "czk",
          unit_amount: amount,
          product_data: {
            name: `MedScopeGlobal reklama — ${req.company}`,
            description: `${req.type} / ${req.position ?? "web"}`,
          },
        },
      },
    ],
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe session bez URL." },
      { status: 502 }
    );
  }

  await admin
    .from("ads_requests")
    .update({
      status: status === "pending" ? "approved" : status,
      stripe_payment_link: session.url,
      stripe_session_id: session.id,
      approved_at: req.approved_at ?? new Date().toISOString(),
    })
    .eq("id", req.id);

  return NextResponse.redirect(session.url);
}
