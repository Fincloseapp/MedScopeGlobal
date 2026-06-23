import { NextResponse } from "next/server";
import { createV27CheckoutSession } from "@/lib/stripe/v27-checkout";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatný JSON" }, { status: 400 });
  }

  const result = await createV27CheckoutSession(body);
  return NextResponse.json(result.body, { status: result.status });
}
