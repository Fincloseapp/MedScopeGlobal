import { NextResponse } from "next/server";
import { V26_ENGINE_VERSION } from "@/lib/v26/version";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: V26_ENGINE_VERSION,
    service: "medscope-v26",
    features: ["editorial-standard", "rewrite-engine", "foreign-news", "autonomous-engine"],
    ts: new Date().toISOString(),
  });
}
