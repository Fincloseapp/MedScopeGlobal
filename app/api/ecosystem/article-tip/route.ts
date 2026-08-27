import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSessionProfile } from "@/lib/auth/session";
import { logArticleTipOrder } from "@/lib/mediflow/store";
import { ARTICLE_TIP_TIERS } from "@/lib/ecosystem/monetization";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

export const dynamic = "force-dynamic";

const ZERO_DECIMAL = new Set(["jpy", "krw", "vnd", "idr", "huf", "ugx", "clp"]);

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
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

  let userId: string | null = null;
  try {
    const { user } = await getSessionProfile();
    userId = user?.id ?? null;
  } catch {
    /* anonymous tip OK */
  }

  try {
    const stripe = new Stripe(secret);
    const slug = body.articleSlug.trim();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: body.articleTitle
                ? `Tringelt: ${body.articleTitle.slice(0, 80)}`
                : "Tringelt pro autora",
              description: "Volitelný mikro-příspěvek autorovi článku",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/article/${encodeURIComponent(slug)}?tip=1`,
      cancel_url: `${origin}/article/${encodeURIComponent(slug)}`,
      metadata: {
        type: "article_tip",
        articleSlug: slug,
        locale,
      },
      ...(userId ? { client_reference_id: userId } : {}),
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
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[article-tip]", message);
    const isConfig =
      /invalid api key|no such api key|authentication|api_key/i.test(message) ||
      message.includes("Invalid API Key");
    return NextResponse.json(
      {
        error: isConfig
          ? "Stripe klíč je neplatný nebo neúplný — zkontrolujte STRIPE_SECRET_KEY na Workeru"
          : "Chyba při vytváření platby",
        enabled: !isConfig,
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 503 }
    );
  }
}
