import { NextResponse } from "next/server";
import { V29_ENGINE_VERSION } from "@/lib/v29/version";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: V29_ENGINE_VERSION,
    engine: V29_ENGINE_VERSION,
    service: "medscope-v29",
    compat: {
      v27: "27.x legacy",
      v29Health: "/api/v29/health",
    },
    features: [
      "audience-ia",
      "monetization",
      "ai-assistants",
      "editorial-v29",
      "b2b-hub",
      "admin-revenue",
      "homepage-v29.0",
      "image-purge-v29",
      "subscription-monthly-annual",
      "email-engine-v29",
      "ai-newsletter-v29",
      "academy-v35-compat",
    ],
    audiences: ["public", "student", "physician", "b2b"],
    ts: new Date().toISOString(),
  });
}
