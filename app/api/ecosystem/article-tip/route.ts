import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth/session";
import { logArticleTipOrder } from "@/lib/mediflow/store";
import { paymentTiersForUser } from "@/lib/i18n/payment-currency";
import { ARTICLE_TIP_COPY, tipLocale } from "@/lib/ecosystem/tip-copy";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { getStripeSecretKey } from "@/lib/stripe/client";
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
      { error: ARTICLE_TIP_COPY.en.unavailable, enabled: false },
      { status: 503 }
    );
  }

  let body: {
    amount: number;
    currency?: string;
    articleSlug: string;
    articleTitle?: string;
    locale?: GlobalLocaleCode;
    returnPath?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.articleSlug?.trim()) {
    return NextResponse.json({ error: "Missing articleSlug" }, { status: 400 });
  }

  const locale = body.locale ?? "cs";
  const tiers = paymentTiersForUser(locale);
  const currency = (body.currency ?? tiers.currency).toLowerCase();
  const amount = Math.round(Number(body.amount) || 0);

  const copy = ARTICLE_TIP_COPY[tipLocale(locale)];

  if (!amount || amount < tiers.minAmount) {
    const divisor = ZERO_DECIMAL.has(currency) ? 1 : 100;
    return NextResponse.json(
      {
        error: copy.minError(String(tiers.minAmount / divisor), tiers.symbol),
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
    const slug = body.articleSlug.trim();
    const returnPath =
      body.returnPath && body.returnPath.startsWith("/") && !body.returnPath.startsWith("//")
        ? body.returnPath
        : `/article/${encodeURIComponent(slug)}`;

    const session = await createCheckoutSession({
      secretKey: secret,
      mode: "payment",
      successUrl: `${origin}${returnPath}?tip=1`,
      cancelUrl: `${origin}${returnPath}`,
      lineItems: [
        {
          currency,
          unitAmount: amount,
          name: copy.lineItemName(body.articleTitle),
          description: copy.lineItemDescription,
        },
      ],
      metadata: {
        // Tip only — never grant VIP / membership / předplatné on fulfillment.
        type: "article_tip",
        articleSlug: slug,
        locale,
      },
      clientReferenceId: userId,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe nevrátil platební URL", enabled: true },
        { status: 503 }
      );
    }

    if (session.id) {
      try {
        await logArticleTipOrder({
          stripeSessionId: session.id,
          amountMinor: amount,
          currency,
          userId,
          articleSlug: slug,
          articleTitle: body.articleTitle,
          locale,
        });
      } catch (logErr) {
        console.error("[article-tip] order log failed (checkout still valid)", logErr);
      }
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const mapped = stripeErrorToJson(err);
    console.error("[article-tip]", mapped.body.detail ?? mapped.body.error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}
