import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSessionProfile } from "@/lib/auth/session";
import { logArticleTipOrder } from "@/lib/mediflow/store";
import { ARTICLE_TIP_TIERS } from "@/lib/ecosystem/monetization";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Stripe není nakonfigurován", enabled: false }, { status: 503 });
    }

    const body = (await request.json()) as {
      amount: number;
      currency?: string;
      articleSlug: string;
      articleTitle?: string;
      locale?: GlobalLocaleCode;
    };

    if (!body.articleSlug) {
      return NextResponse.json({ error: "Chybí articleSlug" }, { status: 400 });
    }

    const locale = body.locale ?? "cs";
    const tiers = ARTICLE_TIP_TIERS[locale] ?? ARTICLE_TIP_TIERS.cs;
    const currency = body.currency ?? tiers.currency;

    if (!body.amount || body.amount < tiers.minAmount) {
      return NextResponse.json(
        { error: `Minimální tringelt je ${tiers.minAmount / (currency === "czk" ? 100 : currency === "jpy" || currency === "krw" || currency === "vnd" || currency === "idr" || currency === "huf" ? 1 : 100)} ${tiers.symbol}` },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") ?? "https://medscopeglobal.com";
    const { user } = await getSessionProfile();
    const stripe = new Stripe(secret);

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
            unit_amount: body.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/article/${body.articleSlug}?tip=1`,
      cancel_url: `${origin}/article/${body.articleSlug}`,
      metadata: {
        type: "article_tip",
        articleSlug: body.articleSlug,
        locale,
      },
    });

    if (session.id) {
      await logArticleTipOrder({
        stripeSessionId: session.id,
        amountMinor: body.amount,
        currency,
        userId: user?.id ?? null,
        articleSlug: body.articleSlug,
        articleTitle: body.articleTitle,
        locale,
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[article-tip]", err);
    return NextResponse.json({ error: "Chyba při vytváření platby" }, { status: 503 });
  }
}
