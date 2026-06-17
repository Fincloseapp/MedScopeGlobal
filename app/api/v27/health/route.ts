import { NextResponse } from "next/server";
import { V27_ENGINE_VERSION } from "@/lib/v27/version";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: V27_ENGINE_VERSION,
    service: "medscope-v28",
    features: [
      "audience-ia",
      "monetization",
      "ai-assistants",
      "editorial-v28",
      "b2b-hub",
      "admin-revenue",
      "homepage-v28",
      "image-purge-v273",
      "subscription-monthly-annual",
      "email-engine-v28",
      "ai-newsletter-v28",
    ],
    audiences: ["public", "student", "physician", "b2b"],
    ts: new Date().toISOString(),
  });
}
