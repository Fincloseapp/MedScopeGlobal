import { NextResponse } from "next/server";
import { z } from "zod";
import { withApiGuard } from "@/lib/security/api-guard";
import { getAdvertiserContext } from "@/lib/exchange/session";
import { entitlementsFor, EXCHANGE_AD_PACKAGES } from "@/lib/exchange/monetization";
import { recordExchangeMetric } from "@/lib/exchange/observability";

export const dynamic = "force-dynamic";

const schema = z.object({
  format: z.enum(["banner", "sponsored_article", "newsletter"]),
});

export async function POST(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_ads_order" });
  if (!guard.ok) return guard.response;

  const ctx = await getAdvertiserContext(request);
  if (!entitlementsFor(ctx.plan).canBuyAds) {
    recordExchangeMetric("ads_order_blocked", { plan: ctx.plan });
    return NextResponse.json(
      { error: "subscription_required", plan: ctx.plan, upgrade: "/exchange/pricing" },
      { status: 402 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid format" }, { status: 400 });

  recordExchangeMetric("ads_order", { plan: ctx.plan, format: parsed.data.format });
  return NextResponse.json({
    ok: true,
    plan: ctx.plan,
    package: EXCHANGE_AD_PACKAGES[parsed.data.format],
    demo: true,
  });
}
