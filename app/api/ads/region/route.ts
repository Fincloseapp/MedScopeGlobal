import { NextResponse } from "next/server";
import { PRICING } from "@/lib/config/site";
import { REGION_CURRENCY, type RegionCode } from "@/lib/i18n/config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = (searchParams.get("region") ?? "EU") as RegionCode;
  const currency = REGION_CURRENCY[region] ?? "EUR";

  return NextResponse.json({
    region,
    currency,
    subscriptionMonthly: {
      basic: PRICING.basicMonthlyCzk,
      vip: PRICING.vipMonthlyCzk,
      note: "Display amounts use CZK base; Stripe conversion at checkout.",
    },
    adPricingNote:
      "Regional campaigns target locale-specific placements on MedScopeGlobal.",
  });
}
