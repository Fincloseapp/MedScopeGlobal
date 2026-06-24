import { NextResponse } from "next/server";
import { createV27CheckoutSession } from "@/lib/stripe/v27-checkout";

export const dynamic = "force-dynamic";

/** Legacy alias — subscription checkout via Stripe */
export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatný JSON" }, { status: 400 });
  }

  const payload = {
    kind: body.kind ?? "subscription",
    productId: body.productId ?? body.product_id,
    userId: body.userId ?? body.user_id,
  };

  const result = await createV27CheckoutSession(payload);
  return NextResponse.json(result.body, { status: result.status });
}
