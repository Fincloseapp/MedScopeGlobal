import { NextResponse } from "next/server";
import { V24_ENGINE_VERSION } from "@/lib/v24/version";
import { readV24Json, topicMapPath } from "@/lib/v24/data-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const topicMap = readV24Json<Record<string, unknown>>(topicMapPath()) ?? {};
  return NextResponse.json({
    status: "ok",
    version: V24_ENGINE_VERSION,
    metrics: {
      topicsIndexed: Object.keys(topicMap).length,
      layersActive: 6,
    },
  });
}
