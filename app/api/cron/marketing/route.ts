import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runMarketingPipeline } from "@/lib/v25/runners/marketing";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const skipMarketers = url.searchParams.get("skipMarketers") === "1";
  const skipAds = url.searchParams.get("skipAds") === "1";
  const forceReport = url.searchParams.get("forceReport") === "1";

  const result = await runMarketingPipeline({ skipMarketers, skipAds, forceReport });
  return NextResponse.json(result);
}
