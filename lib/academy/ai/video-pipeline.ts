import { logAiEvent } from "@/lib/academy/ai/controller";
import {
  getPreferredVideoProvider,
  queueExternalVideoRender,
} from "@/lib/academy/ai/video-providers";
import { createVideoAssetFromScript } from "@/lib/academy/ai/workers/video-generator";
import { generateVideoScript } from "@/lib/academy/ai/workers/video-script-generator";
import { createServiceRoleClient } from "@/lib/supabase/service";

const PLACEHOLDER_MP4 =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export type RenderLessonVideoResult = {
  ok: boolean;
  lesson_id: string;
  video_asset_id?: string;
  status: string;
  render_provider: string;
  external_job_id?: string;
  public_url?: string;
  lesson_format?: string;
  message?: string;
};

function isPlaceholderAsset(meta: Record<string, unknown>): boolean {
  const url = typeof meta.public_url === "string" ? meta.public_url : "";
  if (meta.render_provider === "placeholder") return true;
  if (meta.pending_external_render === true) return true;
  if (url === PLACEHOLDER_MP4) return true;
  if (
    meta.render_status === "ready" &&
    meta.lesson_format !== "audio_lesson" &&
    !meta.tts_audio_url &&
    url.includes("gtv-videos-bucket")
  ) {
    return true;
  }
  return false;
}

/** Full pipeline: script → provider render → webhook completes (or TTS ready immediately). */
export async function renderLessonVideo(
  lessonId: string,
  taskId?: string
): Promise<RenderLessonVideoResult> {
  const admin = createServiceRoleClient();
  const { data: lesson, error } = await admin
    .from("lessons")
    .select("id, title, content, course_id, video_asset_id")
    .eq("id", lessonId)
    .maybeSingle();

  if (error || !lesson) {
    return {
      ok: false,
      lesson_id: lessonId,
      status: "failed",
      render_provider: getPreferredVideoProvider(),
      message: error?.message ?? "Lesson not found",
    };
  }

  let courseTitle = "MedScope Academy";
  if (lesson.course_id) {
    const { data: course } = await admin
      .from("courses")
      .select("title")
      .eq("id", lesson.course_id)
      .maybeSingle();
    if (course?.title) courseTitle = course.title;
  }

  await logAiEvent({
    taskId,
    worker: "video-pipeline",
    message: "Generating script for lesson video",
    payload: { lesson_id: lessonId, title: lesson.title },
  });

  const { result: script, provider: scriptProvider, fallback } = await generateVideoScript({
    lessonTitle: lesson.title,
    lessonContent: lesson.content ?? "",
    courseTitle,
  });

  await logAiEvent({
    taskId,
    worker: "video-script-generator",
    message: fallback ? "Script fallback" : `Script via ${scriptProvider}`,
    payload: { scenes: script.storyboard.length },
  });

  const asset = await createVideoAssetFromScript({
    title: `AI: ${lesson.title}`,
    script,
    lessonId: lesson.id,
  });

  await logAiEvent({
    taskId,
    worker: "video-pipeline",
    message: `Render queued (${asset.render_provider})`,
    payload: {
      video_asset_id: asset.video_asset_id,
      status: asset.status,
      external_job_id: asset.external_job_id,
      lesson_format: asset.lesson_format,
    },
  });

  return {
    ok: true,
    lesson_id: lessonId,
    video_asset_id: asset.video_asset_id,
    status: asset.status,
    render_provider: asset.render_provider,
    external_job_id: asset.external_job_id,
    public_url: asset.public_url,
    lesson_format: asset.lesson_format,
    message: asset.status === "processing" ? "Awaiting provider webhook" : "Lesson media ready",
  };
}

/** Re-queue render for placeholder or failed video assets (idempotent). */
export async function retryVideoRender(
  videoAssetId: string,
  taskId?: string
): Promise<RenderLessonVideoResult> {
  const admin = createServiceRoleClient();
  const { data: asset, error } = await admin
    .from("video_assets")
    .select("id, title, metadata, status")
    .eq("id", videoAssetId)
    .maybeSingle();

  if (error || !asset) {
    return {
      ok: false,
      lesson_id: "",
      status: "failed",
      render_provider: getPreferredVideoProvider(),
      message: error?.message ?? "Video asset not found",
    };
  }

  const meta = (asset.metadata ?? {}) as Record<string, unknown>;
  const scriptText = String(meta.script ?? "");
  if (!scriptText) {
    return {
      ok: false,
      lesson_id: "",
      video_asset_id: videoAssetId,
      status: "failed",
      render_provider: getPreferredVideoProvider(),
      message: "No script in metadata — run full pipeline from lesson",
    };
  }

  const { data: lesson } = await admin
    .from("lessons")
    .select("id")
    .eq("video_asset_id", videoAssetId)
    .maybeSingle();

  const script = {
    script: scriptText,
    storyboard: (meta.storyboard as Array<{ scene: number; visual: string; narration: string }>) ?? [],
    avatar_type: String(meta.avatar_type ?? "european_medical_lecturer"),
    voice_type: String(meta.voice_type ?? "cs_female_professional"),
    duration_estimate_seconds: Number(meta.duration_seconds ?? 300),
  };

  const render = await queueExternalVideoRender({
    title: asset.title,
    script,
    videoAssetId: asset.id,
    lessonId: lesson?.id,
  });

  const patch: Record<string, unknown> = {
    ...meta,
    ...(render.metadata_patch ?? {}),
    render_provider: render.provider,
    external_job_id: render.external_job_id ?? meta.external_job_id,
    render_status: render.status,
    render_message: render.message,
    pending_external_render: render.status === "processing",
  };

  if (render.tts_audio_url) {
    patch.tts_audio_url = render.tts_audio_url;
    patch.avatar_image_url = render.avatar_image_url;
    patch.lesson_format = "audio_lesson";
    patch.public_url = render.public_url;
    patch.thumbnail_url = render.avatar_image_url;
    patch.pending_external_render = false;
  } else if (render.public_url) {
    patch.public_url = render.public_url;
  }

  await admin
    .from("video_assets")
    .update({
      status:
        render.status === "processing"
          ? "processing"
          : render.status === "failed"
            ? "failed"
            : "ready",
      metadata: patch,
    })
    .eq("id", videoAssetId);

  await logAiEvent({
    taskId,
    worker: "video-pipeline",
    message: `Retry render (${render.provider})`,
    payload: { video_asset_id: videoAssetId, status: render.status },
  });

  const publicUrl =
    render.public_url ?? (typeof patch.public_url === "string" ? patch.public_url : undefined);
  const lessonFormat =
    render.lesson_format ?? (typeof patch.lesson_format === "string" ? patch.lesson_format : undefined);

  return {
    ok: render.status !== "failed",
    lesson_id: lesson?.id ?? "",
    video_asset_id: videoAssetId,
    status: render.status,
    render_provider: render.provider,
    external_job_id: render.external_job_id,
    public_url: publicUrl,
    lesson_format: lessonFormat,
    message: render.message,
  };
}

/** Find lessons with placeholder-only video and queue re-render. */
export async function findPlaceholderVideoAssetIds(limit = 50): Promise<string[]> {
  const admin = createServiceRoleClient();
  const { data: assets } = await admin
    .from("video_assets")
    .select("id, metadata")
    .eq("status", "ready")
    .limit(limit);

  const ids: string[] = [];
  for (const row of assets ?? []) {
    const rowMeta = (row.metadata ?? {}) as Record<string, unknown>;
    if (isPlaceholderAsset(rowMeta)) ids.push(row.id as string);
  }
  return ids;
}
