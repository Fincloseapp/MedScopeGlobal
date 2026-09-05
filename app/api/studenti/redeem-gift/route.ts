import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createStripeClient, getStripeSecretKey } from "@/lib/stripe/client";
import { grantStudentClubAccess } from "@/lib/billing/student-entitlement";
import { isStudentGrantProduct } from "@/lib/v27/config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let sessionId = "";
  try {
    const body = (await request.json()) as { sessionId?: string };
    sessionId = String(body.sessionId ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek" }, { status: 400 });
  }
  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Chybí relace platby" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Nejdřív se přihlaste" }, { status: 401 });
  }

  const secret = getStripeSecretKey();
  if (!secret) {
    return NextResponse.json({ error: "Stripe není nakonfigurován" }, { status: 503 });
  }

  try {
    const stripe = createStripeClient(secret);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const productId = String(session.metadata?.product_id ?? "");
    const paid = session.payment_status === "paid" || session.status === "complete";
    if (!paid || !isStudentGrantProduct(productId)) {
      return NextResponse.json({ error: "Tato platba není studentské předplatné" }, { status: 400 });
    }
    if (session.metadata?.redeemed_by && session.metadata.redeemed_by !== user.id) {
      return NextResponse.json({ error: "Odkaz už byl použit na jiném účtu" }, { status: 409 });
    }
    await grantStudentClubAccess(user.id);
    await stripe.checkout.sessions.update(sessionId, {
      metadata: {
        ...(session.metadata ?? {}),
        redeemed_by: user.id,
        gift: session.metadata?.gift ?? "1",
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Relaci se nepodařilo ověřit" }, { status: 400 });
  }
}
