import { NextResponse } from "next/server";
import { crawlNzipPublicIndex } from "@/lib/v19/nzip-crawl";
import { V19_ENGINE_VERSION } from "@/lib/v19/version";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const result = await crawlNzipPublicIndex({ maxUrls: 3000 });
  return NextResponse.json({
    status: "ok",
    engineVersion: V19_ENGINE_VERSION,
    ...result,
  });
}
