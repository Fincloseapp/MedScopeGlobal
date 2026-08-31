import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createV27CheckoutSession } from "@/lib/stripe/v27-checkout";
import type { V27CheckoutKind } from "@/lib/v27/stripe-products";
import { normalizeLocale } from "@/lib/i18n/config";
import { getServerLocale, getServerRegion } from "@/lib/i18n/server-locale";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { kind?: V27CheckoutKind; productId?: string; userId?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Neplatný JSON" }, { status: 400 });
  }

  let userId = body.userId;
  if (!userId) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) userId = user.id;
    } catch {
      // Anonymous checkout allowed
    }
  }

  const locale = body.locale ? normalizeLocale(body.locale) : await getServerLocale();
  const region = await getServerRegion();

  const result = await createV27CheckoutSession({
    kind: body.kind,
    productId: body.productId,
    userId,
    locale,
    region,
  });

  return NextResponse.json(result.body, { status: result.status });
}
