import { NextResponse } from "next/server";
import { V24_ENGINE_VERSION, V24_LAYERS } from "@/lib/v24/version";
import { V24_DATA_ROOT, V24_LOGS_ROOT } from "@/lib/v24/config";
import { V24_SECTIONS } from "@/lib/v24/sections";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: V24_ENGINE_VERSION,
    layers: V24_LAYERS,
    orchestrator: true,
    engines: ["qa", "seo", "legal", "monitoring", "dedupe", "images"],
    cron: true,
    cronActive: true,
    sections: V24_SECTIONS.map((s) => s.id),
    dataRoot: V24_DATA_ROOT,
    logsRoot: V24_LOGS_ROOT,
  });
}
