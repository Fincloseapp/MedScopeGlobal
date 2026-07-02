import { NextResponse } from "next/server";
import { crawlNzipPublicIndex } from "@/lib/v19/nzip-crawl";
import { buildNzipDeepRegistries } from "@/lib/v19/nzip-registries";
import { V19_ENGINE_VERSION } from "@/lib/v19/version";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const crawl = await crawlNzipPublicIndex({ maxUrls: 3000 });
  const registries = buildNzipDeepRegistries();

  return NextResponse.json({
    status: "ok",
    engineVersion: V19_ENGINE_VERSION,
    crawl,
    registryCounts: registries.counts,
    refreshedAt: new Date().toISOString(),
  });
}
