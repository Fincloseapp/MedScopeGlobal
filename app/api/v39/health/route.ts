import { NextResponse } from "next/server";
import {
  V39_UI_VERSION,
  V39_UI_BUILD_STAMP,
  V39_COMPOSITE_LABEL,
} from "@/lib/v39/version";
import { isLlmConfigured } from "@/lib/ai/chat-json";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { GUIDELINE_SOURCES } from "@/lib/v39/medical-review/engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createServiceRoleClient();
  let medicalReviewsTable = false;
  let reviewCount = 0;
  let criticalCount = 0;

  try {
    const { error } = await admin.from("medical_reviews").select("id").limit(1);
    medicalReviewsTable = !error;
    const { count } = await admin.from("medical_reviews").select("id", { count: "exact", head: true });
    reviewCount = count ?? 0;
    const { count: crit } = await admin
      .from("medical_reviews")
      .select("id", { count: "exact", head: true })
      .eq("severity", "critical");
    criticalCount = crit ?? 0;
  } catch {
    /* ignore */
  }

  return NextResponse.json({
    status: "ok",
    ok: true,
    version: V39_UI_VERSION,
    composite: V39_COMPOSITE_LABEL,
    buildStamp: V39_UI_BUILD_STAMP,
    subsystems: {
      medicalReview: true,
      medicalReviewsTable,
      reviewCount,
      criticalCount,
      llm: isLlmConfigured(),
      guidelines: GUIDELINE_SOURCES,
    },
    features: ["medical-review-v39", "guideline-compliance", "clinical-accuracy"],
    compat: { v40: "/api/v40/health", v38: "/api/v38/health" },
    generatedAt: new Date().toISOString(),
  });
}
