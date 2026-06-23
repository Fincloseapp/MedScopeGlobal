import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { applyAutoFixSuggestions } from "@/lib/v37/quality-engine/autoFix";
import { reviewCourse, reviewVideo } from "@/lib/v37/quality-engine/reviewArticle";
import { persistQualityReview } from "@/lib/v37/quality-engine/autoFix";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const admin = createServiceRoleClient();
  const results: { type: string; id: string; score: number; autoFixed: boolean }[] = [];

  const { data: courses } = await admin
    .from("courses")
    .select("id, title, description, lessons(id)")
    .eq("status", "published")
    .limit(30);

  for (const course of courses ?? []) {
    const lessonCount = Array.isArray(course.lessons) ? course.lessons.length : 0;
    const review = await reviewCourse({
      title: course.title,
      description: course.description ?? "",
      lessonCount,
    });
    await persistQualityReview({ entity_type: "course", entity_id: course.id, review });
    const fix = await applyAutoFixSuggestions({ entity_type: "course", entity_id: course.id, review });
    results.push({ type: "course", id: course.id, score: review.score, autoFixed: fix.applied });
  }

  const { data: videos } = await admin
    .from("video_assets")
    .select("id, title, duration_seconds, metadata")
    .eq("status", "ready")
    .limit(50);

  for (const video of videos ?? []) {
    const meta = (video.metadata ?? {}) as Record<string, unknown>;
    const review = await reviewVideo({
      title: video.title,
      description: String(meta.description ?? ""),
      duration_seconds: video.duration_seconds,
    });
    await persistQualityReview({ entity_type: "video", entity_id: video.id, review });
    const fix = await applyAutoFixSuggestions({ entity_type: "video", entity_id: video.id, review });
    results.push({ type: "video", id: video.id, score: review.score, autoFixed: fix.applied });
  }

  return NextResponse.json({
    ok: true,
    phase: "v37.0-quality-weekly",
    scanned: results.length,
    results,
    generatedAt: new Date().toISOString(),
  });
}
