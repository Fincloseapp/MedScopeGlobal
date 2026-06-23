import { logAiEvent } from "@/lib/academy/ai/controller";

import { renderLessonVideo } from "@/lib/academy/ai/video-pipeline";



export async function runVideoProducerStub(

  payload: Record<string, unknown>,

  taskId: string

): Promise<Record<string, unknown>> {

  const lessonId = payload.lesson_id as string | undefined;

  if (!lessonId) {

    return { stub: true, status: "failed", error: "lesson_id required" };

  }



  const result = await renderLessonVideo(lessonId, taskId);



  await logAiEvent({

    taskId,

    worker: "video-producer",

    message: result.ok ? "Pipeline completed" : "Pipeline failed",

    payload: result,

  });



  return {

    stub: false,

    status: result.status,

    title: payload.title,

    lesson_id: lessonId,

    video_asset_id: result.video_asset_id,

    public_url: result.public_url,

    render_provider: result.render_provider,

    external_job_id: result.external_job_id,

    lesson_format: result.lesson_format,

    message: result.message,

  };

}


