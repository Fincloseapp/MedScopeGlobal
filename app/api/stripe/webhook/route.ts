import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logSecurityEvent } from "@/lib/security/security-log";
import { getClientIp } from "@/lib/security/client-ip";
import { activateAdFromCheckout } from "@/lib/ads/activate-from-payment";

export const dynamic = "force-dynamic";

const RELEVANT_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
]);

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(secret);
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    await logSecurityEvent({
      ip,
      action: "stripe:missing_signature",
      status: "blocked",
    });
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    await logSecurityEvent({
      ip,
      action: "stripe:invalid_signature",
      status: "blocked",
      details: { error: err instanceof Error ? err.message : "unknown" },
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!RELEVANT_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const admin = createServiceRoleClient();

  try {
    if (event.type.startsWith("customer.subscription")) {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;

      if (!userId) {
        await logSecurityEvent({
          ip,
          action: "stripe:missing_user_id",
          status: "warning",
          details: { subscriptionId: sub.id, event: event.type },
        });
        return NextResponse.json({ received: true, warning: "no user_id" });
      }

      const statusMap: Record<string, string> = {
        active: "active",
        trialing: "trialing",
        past_due: "past_due",
        canceled: "canceled",
        unpaid: "past_due",
        incomplete: "past_due",
        incomplete_expired: "canceled",
        paused: "past_due",
      };
      const status = statusMap[sub.status] ?? "past_due";

      const row = {
        user_id: userId,
        stripe_subscription_id: sub.id,
        stripe_customer_id: sub.customer as string,
        status,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await admin
        .from("subscriptions")
        .select("id")
        .eq("stripe_subscription_id", sub.id)
        .maybeSingle();

      if (existing?.id) {
        await admin.from("subscriptions").update(row).eq("id", existing.id);
      } else {
        await admin.from("subscriptions").insert(row);
      }

      await logSecurityEvent({
        ip,
        userId,
        action: `stripe:${event.type}`,
        status: "ok",
        details: { subscriptionId: sub.id },
      });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const subscriptionId = session.subscription as string | null;
      const adsRequestId = session.metadata?.ads_request_id;

      if (adsRequestId && session.metadata?.kind === "ad_campaign") {
        const result = await activateAdFromCheckout(session.id, adsRequestId);
        await logSecurityEvent({
          ip,
          action: "stripe:ad_checkout_completed",
          status: result.ok ? "ok" : "error",
          details: { adsRequestId, sessionId: session.id, result },
        });
      }

      if (userId && subscriptionId) {
        await logSecurityEvent({
          ip,
          userId,
          action: "stripe:checkout_completed",
          status: "ok",
          details: { subscriptionId, sessionId: session.id },
        });
      }
    }
  } catch (err) {
    await logSecurityEvent({
      ip,
      action: "stripe:processing_error",
      status: "error",
      details: { error: err instanceof Error ? err.message : "unknown" },
    });
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
