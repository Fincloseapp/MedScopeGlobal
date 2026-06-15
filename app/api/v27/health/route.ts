import { NextResponse } from "next/server";
import { V27_ENGINE_VERSION } from "@/lib/v27/version";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: V27_ENGINE_VERSION,
    service: "medscope-v27",
    features: [
      "audience-ia",
      "monetization",
      "ai-assistants",
      "editorial-v27",
      "b2b-hub",
      "admin-revenue",
      "homepage-v273",
      "image-purge-v273",
      "subscription-monthly-annual",
    ],
    audiences: ["public", "student", "physician", "b2b"],
    ts: new Date().toISOString(),
  });
}
