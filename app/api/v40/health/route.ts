import { NextResponse } from "next/server";
import {
  V40_UI_VERSION,
  V40_UI_BUILD_STAMP,
  V40_COMPOSITE_LABEL,
} from "@/lib/v40/version";
import { V39_UI_VERSION } from "@/lib/v39/version";
import { V38_UI_VERSION } from "@/lib/v38/version";
import { V37_UI_VERSION } from "@/lib/v37/version";
import { V36_UI_VERSION } from "@/lib/v36/version";
import { V35_UI_VERSION } from "@/lib/v35/version";
import { V34_UI_VERSION } from "@/lib/v34/version";
import { V33_UI_VERSION, V33_FALLBACK_MP4_URL } from "@/lib/v33/version";
import { isLlmConfigured } from "@/lib/ai/chat-json";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { isElevenLabsConfigured, validateElevenLabsKey } from "@/lib/v40/ai/voice-elevenlabs";
import { isDidConfigured } from "@/lib/v40/ai/avatar-did";
import { countPublishedCourses, countVideoLessons } from "@/lib/academy/db";
import { V46_UI_VERSION, V46_COMPOSITE_LABEL } from "@/lib/v46/version";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createServiceRoleClient();

  let elevenlabsValid = false;
  let elevenlabsStatus = 0;
  if (isElevenLabsConfigured()) {
    const check = await validateElevenLabsKey();
    elevenlabsValid = check.valid;
    elevenlabsStatus = check.status;
  }

  let fallbackOk = false;
  try {
    const res = await fetch(V33_FALLBACK_MP4_URL, { method: "HEAD", signal: AbortSignal.timeout(8000) });
    fallbackOk = res.ok;
  } catch {
    fallbackOk = false;
  }

  let videoJobsTable = false;
  let auditReportsTable = false;
  let medicalReviewsTable = false;
  let jobCount = 0;

  try {
    const { error: vj } = await admin.from("v40_video_jobs").select("id").limit(1);
    videoJobsTable = !vj;
    const { count } = await admin.from("v40_video_jobs").select("id", { count: "exact", head: true });
    jobCount = count ?? 0;
    const { error: ar } = await admin.from("v40_audit_reports").select("id").limit(1);
    auditReportsTable = !ar;
    const { error: mr } = await admin.from("medical_reviews").select("id").limit(1);
    medicalReviewsTable = !mr;
  } catch {
    /* ignore */
  }

  const [courseCount, videoLessonCount] = await Promise.all([
    countPublishedCourses(),
    countVideoLessons(),
  ]);

  return NextResponse.json({
    status: "ok",
    ok: true,
    version: V40_UI_VERSION,
    composite: V46_COMPOSITE_LABEL,
    siteVersion: V46_UI_VERSION,
    buildStamp: V40_UI_BUILD_STAMP,
    subsystems: {
      v33: { version: V33_UI_VERSION, videoFallback: fallbackOk ? "ok" : "unreachable" },
      v34: { version: V34_UI_VERSION, videoEngine: true },
      v35: { version: V35_UI_VERSION, courseCount, videoLessonCount },
      v36: { version: V36_UI_VERSION, analytics: true },
      v37: { version: V37_UI_VERSION, qualityEngine: true },
      v38: { version: V38_UI_VERSION, conversionEngine: true },
      v39: { version: V39_UI_VERSION, medicalReview: true, medicalReviewsTable },
      v40: {
        version: V40_UI_VERSION,
        videoEngine: true,
        courseGeneration: true,
        validation: true,
        audit: true,
        videoJobsTable,
        auditReportsTable,
        jobCount,
        elevenlabs: isElevenLabsConfigured(),
        elevenlabsValid,
        elevenlabsStatus,
        did: isDidConfigured(),
        llm: isLlmConfigured(),
      },
      v41: { ttsRoutes: ["/api/tts", "/api/voice", "/api/video/voice"], health: "/api/v41/health" },
      v42: { keyRotation: "/api/cron/v42-key-rotation-check", health: "/api/v42/health" },
      v43: { healthMonitor: "/api/cron/v43-health-monitor", health: "/api/v43/health" },
      v44: { regionHealth: "/api/v44/region-health" },
      v45: { performance: "/api/v45/health" },
      v46: { security: "/api/v46/security/report", version: V46_UI_VERSION },
    },
    features: [
      "ai-video-engine-v40",
      "elevenlabs-tts",
      "openai-tts-fallback",
      "text-only-fallback-v41",
      "course-generation-v40",
      "course-validation-v40",
      "medical-review-v39",
      "audit-engine-v40",
      "key-rotation-v42",
      "health-monitor-v43",
      "region-probe-v44",
      "performance-audit-v45",
      "security-engine-v46",
      "w3schools-fallback",
    ],
    blockers: !elevenlabsValid && elevenlabsStatus === 401 && isElevenLabsConfigured()
      ? ["ElevenLabs TTS probe failed — check key permissions or account status"]
      : [],
    compat: {
      v39: "/api/v39/health",
      v38: "/api/v38/health",
      v41: "/api/v41/health",
      v43: "/api/v43/health",
      v45: "/api/v45/health",
      v46: "/api/v46/security/report",
      audit: "/api/v40/audit/report",
      courseGenerate: "/api/course/generate",
      videoGenerate: "/api/v40/video/generate",
      tts: "/api/tts",
    },
    generatedAt: new Date().toISOString(),
  });
}
