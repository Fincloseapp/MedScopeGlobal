import { NextResponse } from "next/server";
import { withApiGuard } from "@/lib/security/api-guard";
import { getAdvertiserContext } from "@/lib/exchange/session";
import { entitlementsFor, EXCHANGE_COMMISSION, EXCHANGE_PLANS_SPEC } from "@/lib/exchange/monetization";
import { DEMO_INQUIRIES } from "@/lib/exchange/inquiries";
import { DEMO_LISTINGS } from "@/lib/exchange/seed";
import { EXCHANGE_TARGET_LOCALES } from "@/lib/exchange/locales";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const guard = await withApiGuard(request, { action: "exchange_metrics" });
  if (!guard.ok) return guard.response;

  const ctx = await getAdvertiserContext(request);
  const access = entitlementsFor(ctx.plan);
  const stats = access.canSeeStats
    ? {
        inquiries: DEMO_INQUIRIES.length,
        listings: DEMO_LISTINGS.length,
        regions: {
          EU: DEMO_LISTINGS.filter((item) => item.availabilityRegions.includes("EU") || item.availabilityRegions.includes("Global")).length,
          USA: DEMO_LISTINGS.filter((item) => item.availabilityRegions.includes("USA") || item.availabilityRegions.includes("Global")).length,
          Asia: DEMO_LISTINGS.filter((item) => item.availabilityRegions.includes("Asia") || item.availabilityRegions.includes("Global")).length,
        },
        locales: EXCHANGE_TARGET_LOCALES,
      }
    : { locked: true, upgrade: "/exchange/pricing" };

  return NextResponse.json({
    ok: true,
    plan: ctx.plan,
    revenueModel: EXCHANGE_COMMISSION.revenueModel,
    dealCommissionPercent: EXCHANGE_COMMISSION.dealCommissionPercent,
    plans: EXCHANGE_PLANS_SPEC,
    stats,
  });
}
