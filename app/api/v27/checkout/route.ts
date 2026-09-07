import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createV27CheckoutSession } from "@/lib/stripe/v27-checkout";
import type { V27CheckoutKind } from "@/lib/v27/stripe-products";
import { normalizeLocale } from "@/lib/i18n/config";
import { getServerLocale, getServerRegion } from "@/lib/i18n/server-locale";
import { normalizeAiAgentSlug } from "@/lib/growth/ai-agent-program";
import { readAiRefFromCookieHeader } from "@/lib/growth/ai-ref-cookie";
import { requestCountry } from "@/lib/growth/request-country";
import { logMonetizationEvent } from "@/lib/monetization/log-event";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: {
    kind?: V27CheckoutKind;
    productId?: string;
    userId?: string;
    locale?: string;
    gift?: boolean;
    aiRef?: string;
    returnPath?: string;
  };
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

  const aiRef =
    normalizeAiAgentSlug(body.aiRef) ?? readAiRefFromCookieHeader(request.headers.get("cookie"));

  const result = await createV27CheckoutSession({
    kind: body.kind,
    productId: body.productId,
    userId,
    locale,
    region,
    gift: Boolean(body.gift),
    aiRef,
    returnPath: body.returnPath,
  });
  if (result.status === 200) {
    const country = requestCountry(request.headers);
    await logMonetizationEvent("ai_agent_checkout", {
      agent: aiRef ?? "other",
      locale,
      productId: body.productId,
      ...(country ? { country } : {}),
    });
  }

  return NextResponse.json(result.body, { status: result.status });
}
