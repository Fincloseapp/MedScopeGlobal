import { NextResponse } from "next/server";
import {
  V33_UI_VERSION,
  V33_UI_BUILD_STAMP,
  V33_FALLBACK_MP4_URL,
} from "@/lib/v33/version";
import { V34_UI_VERSION } from "@/lib/v34/version";
import { V35_UI_VERSION } from "@/lib/v35/version";
import { V36_UI_VERSION } from "@/lib/v36/version";
import {
  V37_UI_VERSION,
  V37_UI_BUILD_STAMP,
} from "@/lib/v37/version";
import {
  V38_UI_VERSION,
  V38_UI_BUILD_STAMP,
  V38_COMPOSITE_LABEL,
} from "@/lib/v38/version";
import { V39_UI_VERSION } from "@/lib/v39/version";
import { V40_UI_VERSION, V40_COMPOSITE_LABEL } from "@/lib/v40/version";
import { countPublishedCourses, countVideoLessons } from "@/lib/academy/db";
import { isLlmConfigured } from "@/lib/ai/chat-json";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createServiceRoleClient();

  let videoProvider = "w3schools-fallback";
  try {
    const res = await fetch(V33_FALLBACK_MP4_URL, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) videoProvider = "fallback-unreachable";
  } catch {
    videoProvider = "fallback-unreachable";
  }

  const [courseCount, videoLessonCount] = await Promise.all([
    countPublishedCourses(),
    countVideoLessons(),
  ]);

  let watchEventsTable = false;
  let qualityReviewsTable = false;
  let conversionNudgesTable = false;
  try {
    const { error: we } = await admin.from("video_watch_events").select("id").limit(1);
    watchEventsTable = !we;
    const { error: qr } = await admin.from("content_quality_reviews").select("id").limit(1);
    qualityReviewsTable = !qr;
    const { error: cn } = await admin.from("conversion_nudges").select("id").limit(1);
    conversionNudgesTable = !cn;
  } catch {
    /* ignore */
  }

  return NextResponse.json({
    status: "ok",
    ok: true,
    version: V38_UI_VERSION,
    siteVersion: V40_UI_VERSION,
    composite: V40_COMPOSITE_LABEL,
    buildStamp: V38_UI_BUILD_STAMP,
    subsystems: {
      v33: { version: V33_UI_VERSION, buildStamp: V33_UI_BUILD_STAMP, navbar: "ok", videoProvider },
      v34: { version: V34_UI_VERSION, videoEngine: true, watchEventsTable },
      v35: { version: V35_UI_VERSION, contentValidation: true, courseCount, videoLessonCount },
      v36: { version: V36_UI_VERSION, analytics: true },
      v37: { version: V37_UI_VERSION, qualityEngine: true, qualityReviewsTable, llm: isLlmConfigured() },
      v38: {
        version: V38_UI_VERSION,
        conversionEngine: true,
        conversionNudgesTable,
        navUx: "ok",
        llm: isLlmConfigured(),
      },
      v39: { version: V39_UI_VERSION, medicalReview: true },
      v40: { version: V40_UI_VERSION, videoEngine: true, courseGeneration: true, audit: true },
    },
    features: [
      "navbar-v33",
      "nav-ux-v38",
      "conversion-engine-v38",
      "video-engine-v34",
      "course-validation-v35",
      "video-analytics-v36",
      "quality-engine-v37",
      "medical-review-v39",
      "ai-video-engine-v40",
      "media-src-csp",
    ],
    compat: {
      v40: "/api/v40/health",
      v39: "/api/v39/health",
      v37: "/api/v37/health",
      v33: "/api/v33/health",
      academy: "/api/academy/health",
    },
    generatedAt: new Date().toISOString(),
  });
}
