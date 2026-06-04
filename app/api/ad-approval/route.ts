import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendAdApprovalEmail } from "@/lib/services/ads-mail";
import { SITE } from "@/lib/config/site";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  const { data: req, error } = await admin
    .from("ads_requests")
    .select("*")
    .eq("approval_token", token)
    .eq("status", "pending")
    .maybeSingle();

  if (error || !req) {
    return new NextResponse("Žádost nenalezena nebo již zpracována.", { status: 404 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  let paymentLink: string | null = req.stripe_payment_link;

  if (stripeKey && !paymentLink) {
    const stripe = new Stripe(stripeKey);
    const amount = Math.round((req.price ?? 0) * 100);
    if (amount > 0) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${SITE.url}/inzerce/formular?paid=1`,
        cancel_url: `${SITE.url}/inzerce/formular?paid=0`,
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
      paymentLink = session.url;
      await admin
        .from("ads_requests")
        .update({
          status: "approved",
          stripe_payment_link: paymentLink,
          stripe_session_id: session.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", req.id);
    }
  } else {
    await admin
      .from("ads_requests")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", req.id);
  }

  if (paymentLink) {
    await sendAdApprovalEmail(req, paymentLink);
    return NextResponse.redirect(paymentLink);
  }

  return new NextResponse(
    `<html><body><h1>Reklama schválena</h1><p>Stripe není nakonfigurován — kontaktujte ads@medscopeglobal.com.</p></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
