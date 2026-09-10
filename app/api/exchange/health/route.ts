import { NextResponse } from "next/server";
import { AVAILABILITY_REGIONS, regionFromCountry } from "@/lib/exchange/regions";
import { EXCHANGE_COMMISSION } from "@/lib/exchange/monetization";
import { EXCHANGE_ROLES } from "@/lib/exchange/roles";
import { EXCHANGE_TARGET_LOCALES } from "@/lib/exchange/locales";
import { requestCountry } from "@/lib/growth/request-country";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const country = requestCountry(request.headers);
  return NextResponse.json({
    ok: true,
    module: "medscope-b2b-exchange",
    availability_region: AVAILABILITY_REGIONS,
    detectedRegion: regionFromCountry(country),
    country,
    locales: EXCHANGE_TARGET_LOCALES,
    roles: EXCHANGE_ROLES,
    contactCommissionPercent: EXCHANGE_COMMISSION.contactFeePercent,
    processesPayments: EXCHANGE_COMMISSION.processesPayments,
  });
}
