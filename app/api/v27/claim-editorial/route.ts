import { NextResponse } from "next/server";
import { createStripeClient, getStripeSecretKey } from "@/lib/stripe/client";
import { isEditorialGrantProduct } from "@/lib/v27/config";
import {
  EDITORIAL_PAID_COOKIE,
  editorialCookieMaxAgeSec,
} from "@/lib/auth/editorial-cookie";

export const dynamic = "force-dynamic";

const NO_STORE = "private, no-cache, no-store, must-revalidate";

function cookieBase(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function POST(request: Request) {
  let sessionId = "";
  try {
    const body = (await request.json()) as { sessionId?: string };
    sessionId = String(body.sessionId ?? "").trim();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "missing_session" }, { status: 400 });
  }

  const secret = getStripeSecretKey();
  if (!secret) {
    return NextResponse.json({ error: "stripe_missing", enabled: false }, { status: 503 });
  }

  try {
    const stripe = createStripeClient(secret);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });
    const productId = String(session.metadata?.product_id ?? "");
    const paid = session.payment_status === "paid" || session.status === "complete";
    if (!paid || !isEditorialGrantProduct(productId)) {
      return NextResponse.json({ error: "not_editorial" }, { status: 403 });
    }

    let periodEndMs = Date.now() + (productId.endsWith("-year") ? 366 : 31) * 86_400_000;
    const sub = session.subscription;
    if (sub && typeof sub !== "string" && sub.current_period_end) {
      periodEndMs = sub.current_period_end * 1000;
    }

    const res = NextResponse.json({ ok: true, until: new Date(periodEndMs).toISOString() });
    res.headers.set("Cache-Control", NO_STORE);
    res.cookies.set(EDITORIAL_PAID_COOKIE, String(periodEndMs), cookieBase(editorialCookieMaxAgeSec(periodEndMs)));
    return res;
  } catch {
    return NextResponse.json({ error: "claim_failed" }, { status: 400 });
  }
}
