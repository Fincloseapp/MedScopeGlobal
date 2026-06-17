import { NextResponse } from "next/server";
import {
  ACADEMY_VERSION,
  checkAcademyTables,
  countPrepCourses,
  countPublishedCourses,
  countVideoLessons,
} from "@/lib/academy/db";
import { getDigestDeliveryStatus } from "@/lib/academy/marketing/digest-config";
import { isExpertReviewAutoPublishEnabled, getVideoWebhookUrl } from "@/lib/academy/settings";
import { isLlmConfigured } from "@/lib/ai/chat-json";
import { getPreferredVideoProvider, isHeyGenConfigured, isSynthesiaConfigured } from "@/lib/academy/ai/video-providers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [tables, courseCount, videoLessonCount, prepCourseCount] = await Promise.all([
      checkAcademyTables(),
      countPublishedCourses(),
      countVideoLessons(),
      countPrepCourses(),
    ]);
    const allTablesOk = Object.values(tables).every(Boolean);

    const digest = getDigestDeliveryStatus();

    return NextResponse.json({
      version: ACADEMY_VERSION,
      ok: allTablesOk,
      tables,
      courseCount,
      videoLessonCount,
      prepCourseCount,
      digestDeliveryMode: digest.mode,
      llmConfigured: isLlmConfigured(),
      videoProvider: getPreferredVideoProvider(),
      heygenConfigured: isHeyGenConfigured(),
      synthesiaConfigured: isSynthesiaConfigured(),
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        version: ACADEMY_VERSION,
        ok: false,
        error: (e as Error).message,
        generatedAt: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
