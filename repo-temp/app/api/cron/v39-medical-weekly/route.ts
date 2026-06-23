import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { reviewMedicalContent } from "@/lib/v39/medical-review/engine";
import { persistMedicalReview } from "@/lib/v39/medical-review/persist";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const admin = createServiceRoleClient();
  const results: { type: string; id: string; score: number; severity: string }[] = [];

  const { data: lessons } = await admin
    .from("lessons")
    .select("id, title, content")
    .eq("status", "published")
    .limit(20);

  for (const lesson of lessons ?? []) {
    const review = await reviewMedicalContent({
      title: lesson.title,
      content: lesson.content ?? "",
      entityType: "lesson",
    });
    await persistMedicalReview({ entity_type: "lesson", entity_id: lesson.id, review });
    results.push({ type: "lesson", id: lesson.id, score: review.score, severity: review.severity });
  }

  const { data: courses } = await admin
    .from("courses")
    .select("id, title, description")
    .eq("status", "published")
    .limit(15);

  for (const course of courses ?? []) {
    const review = await reviewMedicalContent({
      title: course.title,
      content: course.description ?? "",
      entityType: "course",
    });
    await persistMedicalReview({ entity_type: "course", entity_id: course.id, review });
    results.push({ type: "course", id: course.id, score: review.score, severity: review.severity });
  }

  return NextResponse.json({
    ok: true,
    phase: "v39.0-medical-weekly",
    scanned: results.length,
    results,
    generatedAt: new Date().toISOString(),
  });
}
