import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { logSecurityEvent } from "@/lib/security/security-log";
import { getClientIp } from "@/lib/security/client-ip";
import { activateAdFromCheckout } from "@/lib/ads/activate-from-payment";
import { persistStripeWebhookLog } from "@/lib/billing/stripe-webhook-log";
import { notifySubscriptionConfirmed } from "@/lib/notifications/engine";
import { updateUserProgress } from "@/lib/academy/db";

export const dynamic = "force-dynamic";

const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "invoice.paid",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
]);

function extractCustomerId(obj: unknown): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const row = obj as Record<string, unknown>;
  if (typeof row.customer === "string") return row.customer;
  if (row.customer && typeof row.customer === "object" && "id" in (row.customer as object)) {
    return String((row.customer as { id: string }).id);
  }
  return undefined;
}

function extractObjectId(obj: unknown): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const id = (obj as { id?: string }).id;
  return typeof id === "string" ? id : undefined;
}

async function upsertSubscription(admin: ReturnType<typeof createServiceRoleClient>, sub: Stripe.Subscription, ip: string) {
  const userId = sub.metadata?.user_id;
  if (!userId) {
    await logSecurityEvent({
      ip,
      action: "stripe:missing_user_id",
      status: "warning",
      details: { subscriptionId: sub.id },
    });
    return;
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
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!secret) {
    return NextResponse.json({ error: "Stripe secret key not configured" }, { status: 503 });
  }

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not configured — see D:\\medscope.data\\docs\\v28.2-stripe-setup.md" },
      { status: 503 }
    );
  }

  const stripe = new Stripe(secret);
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    await logSecurityEvent({ ip, action: "stripe:missing_signature", status: "blocked" });
    await persistStripeWebhookLog({
      eventType: "unknown",
      status: "failed",
      error: "Missing stripe-signature header",
    });
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    await logSecurityEvent({
      ip,
      action: "stripe:invalid_signature",
      status: "blocked",
      details: { error: message },
    });
    await persistStripeWebhookLog({
      eventType: "signature_error",
      status: "failed",
      error: message,
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const obj = event.data.object;
  await persistStripeWebhookLog({
    eventId: event.id,
    eventType: event.type,
    livemode: event.livemode,
    apiVersion: event.api_version ?? undefined,
    status: HANDLED_EVENTS.has(event.type) ? "received" : "ignored",
    objectId: extractObjectId(obj),
    customerId: extractCustomerId(obj),
    payload: { type: event.type, id: event.id },
  });

  if (!HANDLED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, ignored: true, type: event.type });
  }

  const admin = createServiceRoleClient();

  try {
    if (event.type.startsWith("customer.subscription")) {
      const sub = event.data.object as Stripe.Subscription;
      await upsertSubscription(admin, sub, ip);
      await logSecurityEvent({
        ip,
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
      const customerEmail = session.customer_details?.email ?? session.customer_email ?? undefined;

      if (adsRequestId && session.metadata?.kind === "ad_campaign") {
        const result = await activateAdFromCheckout(session.id, adsRequestId);
        await logSecurityEvent({
          ip,
          action: "stripe:ad_checkout_completed",
          status: result.ok ? "ok" : "error",
          details: { adsRequestId, sessionId: session.id, result },
        });
      }

      if (session.metadata?.v27_checkout === "true" && session.id) {
        await admin
          .from("v27_orders")
          .update({
            status: "paid",
            stripe_payment_intent_id: (session.payment_intent as string) ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_session_id", session.id);

        if (customerEmail && session.metadata?.product_id) {
          void notifySubscriptionConfirmed(
            customerEmail,
            session.metadata.product_id.replace(/-month|-year/g, "")
          );
        }

        await logSecurityEvent({
          ip,
          action: "stripe:v27_checkout_completed",
          status: "ok",
          details: {
            sessionId: session.id,
            kind: session.metadata?.kind,
            productId: session.metadata?.product_id,
          },
        });
      }

      if (session.metadata?.academy_marketplace === "true" && session.id) {
        const buyerId = session.metadata.user_id;
        const courseId = session.metadata.course_id;
        const listingId = session.metadata.listing_id;

        if (buyerId && courseId) {
          await updateUserProgress(buyerId, {
            course_id: courseId,
            status: "in_progress",
            progress_pct: 0,
          });

          if (listingId) {
            const { data: listing } = await admin
              .from("marketplace_courses")
              .select("listing_metadata")
              .eq("id", listingId)
              .maybeSingle();

            const prevMeta = (listing?.listing_metadata ?? {}) as Record<string, unknown>;
            const purchases = Array.isArray(prevMeta.purchases) ? prevMeta.purchases : [];
            purchases.push({
              user_id: buyerId,
              session_id: session.id,
              purchased_at: new Date().toISOString(),
            });

            await admin
              .from("marketplace_courses")
              .update({
                listing_metadata: { ...prevMeta, purchases },
                updated_at: new Date().toISOString(),
              })
              .eq("id", listingId);
          }
        }

        await logSecurityEvent({
          ip,
          userId: buyerId,
          action: "stripe:academy_marketplace_completed",
          status: "ok",
          details: {
            sessionId: session.id,
            courseId,
            listingId,
            amountTotal: session.amount_total,
            currency: session.currency,
          },
        });

        await persistStripeWebhookLog({
          eventId: event.id,
          eventType: "academy_marketplace.purchase",
          livemode: event.livemode,
          status: "processed",
          objectId: session.id,
          payload: {
            sessionId: session.id,
            courseId,
            listingId,
            userId: buyerId,
            amountTotal: session.amount_total,
            currency: session.currency,
          },
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

    if (event.type === "invoice.paid" || event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      const customerEmail = invoice.customer_email ?? undefined;
      if (customerEmail) {
        await logSecurityEvent({
          ip,
          action: "stripe:invoice_paid",
          status: "ok",
          details: { invoiceId: invoice.id, amount: invoice.amount_paid },
        });
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      await logSecurityEvent({
        ip,
        action: "stripe:invoice_payment_failed",
        status: "warning",
        details: { invoiceId: invoice.id, customer: invoice.customer },
      });
    }

    if (event.type === "payment_intent.succeeded" || event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      await logSecurityEvent({
        ip,
        action: `stripe:${event.type}`,
        status: event.type.endsWith("succeeded") ? "ok" : "warning",
        details: { paymentIntentId: pi.id, amount: pi.amount },
      });
    }

    await persistStripeWebhookLog({
      eventId: event.id,
      eventType: event.type,
      livemode: event.livemode,
      status: "processed",
      objectId: extractObjectId(obj),
      customerId: extractCustomerId(obj),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    await persistStripeWebhookLog({
      eventId: event.id,
      eventType: event.type,
      status: "failed",
      error: message,
    });
    await logSecurityEvent({
      ip,
      action: "stripe:processing_error",
      status: "error",
      details: { error: message, eventType: event.type },
    });
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true, type: event.type });
}
