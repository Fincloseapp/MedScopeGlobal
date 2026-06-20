import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  generateContentSlideshow,
  persistSlideshowToLesson,
  scoreTopicAlignment,
} from "@/lib/v25/video/content-slideshow";
import { isGroqConfigured } from "@/lib/ai/groq-client";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: RouteCtx) {
  const { id: lessonId } = await ctx.params;

  if (!isGroqConfigured()) {
    return NextResponse.json({ ok: false, error: "GROQ_API_KEY not configured" }, { status: 503 });
  }

  const admin = createServiceRoleClient();
  const { data: lesson, error } = await admin
    .from("lessons")
    .select("id, title, content, content_json, video_asset_id, course_id")
    .eq("id", lessonId)
    .maybeSingle();

  if (error || !lesson) {
    return NextResponse.json({ ok: false, error: "Lesson not found" }, { status: 404 });
  }

  let courseTopic = "";
  if (lesson.course_id) {
    const { data: course } = await admin
      .from("courses")
      .select("title")
      .eq("id", lesson.course_id)
      .maybeSingle();
    courseTopic = course?.title ?? "";
  }

  const manifest = await generateContentSlideshow({
    lessonTitle: lesson.title,
    lessonBody: lesson.content ?? "",
    courseTopic,
  });

  if (!manifest) {
    return NextResponse.json({ ok: false, error: "Slideshow generation failed" }, { status: 500 });
  }

  manifest.alignmentScore = scoreTopicAlignment(lesson.title, manifest);
  const saved = await persistSlideshowToLesson({
    lessonId,
    manifest,
    videoAssetId: lesson.video_asset_id,
  });

  return NextResponse.json({
    ok: saved,
    lessonId,
    alignmentScore: manifest.alignmentScore,
    slideCount: manifest.slides.length,
    topic: manifest.topic,
    firstSlideTitle: manifest.slides[0]?.title,
    provider: manifest.provider,
  });
}
