import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSessionProfile } from "@/lib/auth/session";
import { logDonationOrder } from "@/lib/mediflow/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: "Stripe není nakonfigurován" }, { status: 503 });
    }

    const body = (await request.json()) as {
      amount: number;
      currency: string;
      articleSlug?: string;
      articleTitle?: string;
    };

    if (!body.amount || body.amount < 100) {
      return NextResponse.json({ error: "Minimální částka je 1 Kč" }, { status: 400 });
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
            currency: body.currency,
            product_data: {
              name: body.articleTitle
                ? `Dar autorovi: ${body.articleTitle.slice(0, 80)}`
                : "Podpora MedScopeGlobal",
              description: "Mikro-dar pro podporu tvorby obsahu",
            },
            unit_amount: body.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/article/${body.articleSlug ?? ""}?donated=1`,
      cancel_url: `${origin}/article/${body.articleSlug ?? ""}`,
      metadata: {
        type: "donation",
        articleSlug: body.articleSlug ?? "",
      },
    });

    if (session.id) {
      await logDonationOrder({
        stripeSessionId: session.id,
        amountMinor: body.amount,
        currency: body.currency,
        userId: user?.id ?? null,
        articleSlug: body.articleSlug,
        articleTitle: body.articleTitle,
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[donate]", err);
    return NextResponse.json({ error: "Chyba při vytváření platby" }, { status: 503 });
  }
}
