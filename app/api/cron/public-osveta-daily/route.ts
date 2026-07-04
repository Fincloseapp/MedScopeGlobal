import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runDailyPublicOsvetaGeneration } from "@/lib/verejnost/osveta/daily-generator";
import { checkPublicOsvetaTables, countPublishedOsvetaVideos } from "@/lib/verejnost/osveta/db";
import { getPreferredVideoProvider } from "@/lib/academy/ai/video-providers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const tables = await checkPublicOsvetaTables();
  const videoCount = await countPublishedOsvetaVideos();
  const result = await runDailyPublicOsvetaGeneration();

  return NextResponse.json({
    ok: Object.values(tables).every(Boolean),
    phase: "public-osveta-daily",
    tables,
    videoCount,
    generation: result,
    videoProvider: getPreferredVideoProvider(),
    generatedAt: new Date().toISOString(),
  });
}
