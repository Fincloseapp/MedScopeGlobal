import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth/session";
import { logArticleTipOrder } from "@/lib/mediflow/store";
import { ARTICLE_TIP_TIERS } from "@/lib/ecosystem/monetization";
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
      { error: "Stripe není nakonfigurován", enabled: false },
      { status: 503 }
    );
  }

  let body: {
    amount: number;
    currency?: string;
    articleSlug: string;
    articleTitle?: string;
    locale?: GlobalLocaleCode;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Neplatný JSON" }, { status: 400 });
  }

  if (!body.articleSlug?.trim()) {
    return NextResponse.json({ error: "Chybí articleSlug" }, { status: 400 });
  }

  const locale = body.locale ?? "cs";
  const tiers = ARTICLE_TIP_TIERS[locale] ?? ARTICLE_TIP_TIERS.cs;
  const currency = (body.currency ?? tiers.currency).toLowerCase();
  const amount = Math.round(Number(body.amount) || 0);

  if (!amount || amount < tiers.minAmount) {
    const divisor = ZERO_DECIMAL.has(currency) ? 1 : 100;
    return NextResponse.json(
      {
        error: `Minimální tringelt je ${tiers.minAmount / divisor} ${tiers.symbol}`,
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

    // Pure fetch + AbortSignal — Node Stripe SDK can hang indefinitely on Workers.
    const session = await createCheckoutSession({
      secretKey: secret,
      mode: "payment",
      successUrl: `${origin}/article/${encodeURIComponent(slug)}?tip=1`,
      cancelUrl: `${origin}/article/${encodeURIComponent(slug)}`,
      lineItems: [
        {
          currency,
          unitAmount: amount,
          name: body.articleTitle
            ? `Tringelt: ${body.articleTitle.slice(0, 80)}`
            : "Tringelt pro autora",
          description: "Volitelný mikro-příspěvek autorovi článku",
        },
      ],
      metadata: {
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
