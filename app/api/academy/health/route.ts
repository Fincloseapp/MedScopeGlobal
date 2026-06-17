import { NextResponse } from "next/server";
import {
  ACADEMY_VERSION,
  checkAcademyTables,
  countPublishedCourses,
  countVideoLessons,
} from "@/lib/academy/db";
import { getDigestDeliveryStatus } from "@/lib/academy/marketing/digest-config";
import { isLlmConfigured } from "@/lib/ai/chat-json";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [tables, courseCount, videoLessonCount] = await Promise.all([
      checkAcademyTables(),
      countPublishedCourses(),
      countVideoLessons(),
    ]);
    const allTablesOk = Object.values(tables).every(Boolean);

    const digest = getDigestDeliveryStatus();

    return NextResponse.json({
      version: ACADEMY_VERSION,
      ok: allTablesOk,
      tables,
      courseCount,
      videoLessonCount,
      digestDeliveryMode: digest.mode,
      llmConfigured: isLlmConfigured(),
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
