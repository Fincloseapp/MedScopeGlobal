import { logAiEvent } from "@/lib/academy/ai/controller";
import { createVideoAssetFromScript } from "@/lib/academy/ai/workers/video-generator";
import { generateVideoScript } from "@/lib/academy/ai/workers/video-script-generator";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function runVideoProducerStub(
  payload: Record<string, unknown>,
  taskId: string
): Promise<Record<string, unknown>> {
  const lessonId = payload.lesson_id as string | undefined;
  const title = String(payload.title ?? "AI video lekce");
  let lessonTitle = title;
  let lessonContent = String(payload.content ?? "");
  let courseTitle = String(payload.course_title ?? "MedScope Academy");

  if (lessonId) {
    const admin = createServiceRoleClient();
    const { data: lesson } = await admin
      .from("lessons")
      .select("title, content, course_id")
      .eq("id", lessonId)
      .maybeSingle();

    if (lesson) {
      lessonTitle = lesson.title;
      lessonContent = lesson.content ?? lessonContent;
      if (lesson.course_id) {
        const { data: course } = await admin
          .from("courses")
          .select("title")
          .eq("id", lesson.course_id)
          .maybeSingle();
        if (course?.title) courseTitle = course.title;
      }
    }
  }

  await logAiEvent({
    taskId,
    worker: "video-producer",
    message: "Generating video script",
    payload: { lesson_id: lessonId, title: lessonTitle },
  });

  const { result: script, provider, fallback } = await generateVideoScript({
    lessonTitle,
    lessonContent,
    courseTitle,
  });

  await logAiEvent({
    taskId,
    worker: "video-script-generator",
    message: fallback ? "Script fallback used" : `Script generated via ${provider}`,
    payload: { provider, scenes: script.storyboard.length },
  });

  const asset = await createVideoAssetFromScript({
    title: `AI: ${lessonTitle}`,
    script,
    lessonId,
  });

  await logAiEvent({
    taskId,
    worker: "video-generator",
    message: "Video asset created",
    payload: { video_asset_id: asset.video_asset_id, generated: asset.generated },
  });

  return {
    stub: fallback,
    status: asset.status,
    title: lessonTitle,
    video_asset_id: asset.video_asset_id,
    public_url: asset.public_url,
    render_provider: asset.render_provider,
    external_job_id: asset.external_job_id,
    script_provider: provider,
    avatar_type: script.avatar_type,
    voice_type: script.voice_type,
  };
}
