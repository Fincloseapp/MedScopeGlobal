import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSessionProfile } from "@/lib/auth/session";
import { logDonationOrder } from "@/lib/mediflow/store";

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
  const minAmount = ZERO_DECIMAL.has(currency) ? 100 : 100;

  if (!amount || amount < minAmount) {
    return NextResponse.json({ error: "Minimální částka je 1 Kč / 1 jednotka" }, { status: 400 });
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
    /* anonymous donation OK */
  }

  try {
    const stripe = new Stripe(secret);
    const slug = (body.articleSlug ?? "").trim();
    const successPath = slug ? `/article/${encodeURIComponent(slug)}?donated=1` : "/?donated=1";
    const cancelPath = slug ? `/article/${encodeURIComponent(slug)}` : "/";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: body.articleTitle
                ? `Dar autorovi: ${body.articleTitle.slice(0, 80)}`
                : "Podpora MedScopeGlobal",
              description: "Mikro-dar pro podporu tvorby obsahu",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}${successPath}`,
      cancel_url: `${origin}${cancelPath}`,
      metadata: {
        type: "donation",
        articleSlug: slug,
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
    const message = err instanceof Error ? err.message : "unknown";
    console.error("[donate]", message);
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
