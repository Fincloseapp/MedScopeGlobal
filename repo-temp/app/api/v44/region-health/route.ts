import { NextResponse } from "next/server";
import { V44_UI_VERSION } from "@/lib/v44/version";
import { probeRegions } from "@/lib/v44/region-health/probe";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await probeRegions();
  return NextResponse.json({
    status: result.overall_ok ? "ok" : "degraded",
    ok: result.overall_ok,
    version: V44_UI_VERSION,
    ...result,
    note: "Vercel edge CDN handles failover; full multi-region switching requires Enterprise config",
    generatedAt: new Date().toISOString(),
  });
}
