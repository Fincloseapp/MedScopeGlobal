import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runPublicArticlesFetch } from "@/lib/v25/runners/public";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const limitRaw = url.searchParams.get("limit");
  const skipAdsRaw = url.searchParams.get("skipAds");
  const skipCoversRaw = url.searchParams.get("skipCovers");
  const locales = url.searchParams
    .get("locales")
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const writerOffsetRaw = url.searchParams.get("writerOffset");
  const writerLimitRaw = url.searchParams.get("writerLimit");

  const result = await runPublicArticlesFetch({
    limitPerWriter: limitRaw != null ? Number(limitRaw) : undefined,
    skipAds: skipAdsRaw == null ? undefined : skipAdsRaw === "1" || skipAdsRaw === "true",
    skipCovers: skipCoversRaw == null ? undefined : skipCoversRaw === "1" || skipCoversRaw === "true",
    locales: locales?.length ? locales : undefined,
    writerOffset: writerOffsetRaw != null ? Number(writerOffsetRaw) : undefined,
    writerLimit: writerLimitRaw != null ? Number(writerLimitRaw) : undefined,
    repairOnly: url.searchParams.get("repairOnly") === "1",
  });
  return NextResponse.json(result);
}
