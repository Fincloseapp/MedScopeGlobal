import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth/session";
import { logDonationOrder } from "@/lib/mediflow/store";
import { getStripeConnectedAccountId, getStripeSecretKey } from "@/lib/stripe/client";
import {
  createCheckoutSession,
  stripeErrorToJson,
} from "@/lib/stripe/checkout-fetch";

export const dynamic = "force-dynamic";

const ZERO_DECIMAL = new Set(["jpy", "krw", "vnd", "idr", "huf", "ugx", "clp"]);

/** Don't let auth/session hang block anonymous Checkout. */
async function optionalUserId(): Promise<string | null> {
  try {
    const result = await Promise.race([
      getSessionProfile(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
    ]);
    if (!result || !("user" in result)) return null;
    return result.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const secret = getStripeSecretKey();
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe není nakonfigurován", enabled: false },
      { status: 503 }
    );
  }

  let body: {
    amount: number;
    currency?: string;
    articleSlug?: string;
    articleTitle?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Neplatný JSON" }, { status: 400 });
  }

  const currency = (body.currency ?? "czk").toLowerCase();
  const amount = Math.round(Number(body.amount) || 0);
  // Stripe card minimum for CZK is typically ~15.00 Kč (1500 haliers).
  const minAmount = currency === "czk" ? 1500 : ZERO_DECIMAL.has(currency) ? 100 : 50;

  if (!amount || amount < minAmount) {
    return NextResponse.json(
      {
        error:
          currency === "czk"
            ? "Minimální dar je 15 Kč (Stripe limit)"
            : "Částka je pod minimem pro danou měnu",
      },
      { status: 400 }
    );
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://medscopeglobal.com";

  const userId = await optionalUserId();

  try {
    const slug = (body.articleSlug ?? "").trim();
    const successPath = slug ? `/article/${encodeURIComponent(slug)}?donated=1` : "/?donated=1";
    const cancelPath = slug ? `/article/${encodeURIComponent(slug)}` : "/";

    const destination = getStripeConnectedAccountId();

    // Pure fetch + AbortSignal — Node Stripe SDK can hang indefinitely on Workers.
    const session = await createCheckoutSession({
      secretKey: secret,
      mode: "payment",
      successUrl: `${origin}${successPath}`,
      cancelUrl: `${origin}${cancelPath}`,
      lineItems: [
        {
          currency,
          unitAmount: amount,
          name: body.articleTitle
            ? `Dar autorovi: ${body.articleTitle.slice(0, 80)}`
            : "Podpora MedScopeGlobal",
          description: "Mikro-dar pro podporu tvorby obsahu",
        },
      ],
      metadata: {
        type: "donation",
        articleSlug: slug,
        ...(destination ? { stripe_destination_account: destination } : {}),
      },
      clientReferenceId: userId,
      connectedAccountId: destination,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe nevrátil platební URL", enabled: true },
        { status: 503 }
      );
    }

    if (session.id) {
      try {
        await logDonationOrder({
          stripeSessionId: session.id,
          amountMinor: amount,
          currency,
          userId,
          articleSlug: body.articleSlug,
          articleTitle: body.articleTitle,
        });
      } catch (logErr) {
        console.error("[donate] order log failed (checkout still valid)", logErr);
      }
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const mapped = stripeErrorToJson(err);
    console.error("[donate]", mapped.body.detail ?? mapped.body.error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}
