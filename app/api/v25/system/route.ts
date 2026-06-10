import { NextResponse } from "next/server";
import { loadV25SystemState } from "@/lib/v25/system-state";
import { verifyV25Apis } from "@/lib/v25/verify";
import { V25_ENGINE_VERSION } from "@/lib/v25/version";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = loadV25SystemState();
  const live = await verifyV25Apis();
  return NextResponse.json({
    version: V25_ENGINE_VERSION,
    state,
    liveApis: live.apis,
    generatedAt: new Date().toISOString(),
  });
}
