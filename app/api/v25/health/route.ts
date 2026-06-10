import { NextResponse } from "next/server";
import { V25_ENGINE_VERSION, V25_FEATURES } from "@/lib/v25/version";
import { V25_DATA_ROOT, V25_LOGS_ROOT } from "@/lib/v25/config";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: V25_ENGINE_VERSION,
    features: V25_FEATURES,
    orchestrator: true,
    linkTest: true,
    screenshots: true,
    navMonitor: true,
    autofix: true,
    redeploy: true,
    rollback: true,
    dataRoot: V25_DATA_ROOT,
    logsRoot: V25_LOGS_ROOT,
  });
}
