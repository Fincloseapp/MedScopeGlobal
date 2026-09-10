import { NextResponse } from "next/server";
import { AVAILABILITY_REGIONS, regionFromCountry, regionLabel } from "@/lib/exchange/regions";
import { requestCountry } from "@/lib/growth/request-country";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "en";
  const country = requestCountry(request.headers);
  return NextResponse.json({
    regions: AVAILABILITY_REGIONS.map((region) => ({
      id: region,
      label: regionLabel(region, locale),
    })),
    detected: regionFromCountry(country),
    country,
  });
}
