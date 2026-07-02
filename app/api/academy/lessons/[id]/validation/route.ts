import { NextResponse } from "next/server";
import { getLessonByIdOrSlug } from "@/lib/academy/db";
import { enrichLessonContent, extractLessonMetadata } from "@/lib/v35/content-validation/enrichLesson";
import { validateLessonContent } from "@/lib/v35/content-validation/validateLesson";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const url = new URL(request.url);
  const courseSlug = url.searchParams.get("course");

  const admin = createServiceRoleClient();
  const { data: lessonRow } = await admin.from("lessons").select("*, courses(slug, title)").eq("id", id).maybeSingle();

  let lesson = null;
  if (lessonRow?.courses && typeof lessonRow.courses === "object" && "slug" in lessonRow.courses) {
    const slug = (lessonRow.courses as { slug: string }).slug;
    lesson = await getLessonByIdOrSlug(slug, id);
  } else if (courseSlug) {
    lesson = await getLessonByIdOrSlug(courseSlug, id);
  }

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const contentJson = (lesson.content_json ?? {}) as Record<string, unknown>;
  const existing = extractLessonMetadata(contentJson);
  const enrichment = await enrichLessonContent({
    title: lesson.title,
    content: lesson.content,
    existing,
  });

  const validation = await validateLessonContent({
    lessonTitle: lesson.title,
    lessonContent: lesson.content,
    videoTitle: lesson.video?.title,
    videoDescription: String((lesson.video?.metadata as Record<string, unknown>)?.description ?? ""),
  });

  const metadata = {
    ...contentJson,
    ...enrichment,
    content_mismatch: validation.content_mismatch,
    validation_flags: validation.flags,
    validation_reason: validation.reason,
  };

  return NextResponse.json({
    ok: true,
    version: "v35.0",
    lessonId: lesson.id,
    validation,
    enrichment,
    metadata,
    adminFlag: validation.content_mismatch ? "mismatched_content" : null,
  });
}
