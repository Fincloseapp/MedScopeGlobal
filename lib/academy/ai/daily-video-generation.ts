import { enqueueAiTask, dispatchAiTask } from "@/lib/academy/ai/controller";

import { findPlaceholderVideoAssetIds, retryVideoRender } from "@/lib/academy/ai/video-pipeline";

import { createServiceRoleClient } from "@/lib/supabase/service";



export type DailyVideoGenerationResult = {

  skipped: boolean;

  reason?: string;

  lessonsQueued: number;

  placeholdersRetried: number;

  tasks: { lessonId: string; taskId: string; ok: boolean }[];

};



const MAX_LESSONS_PER_RUN = 3;

const MAX_PLACEHOLDER_RETRIES = 2;



/** Enqueue video-producer for published lessons missing video_asset_id; retry placeholders. */

export async function runDailyVideoGeneration(): Promise<DailyVideoGenerationResult> {

  const admin = createServiceRoleClient();



  const { data: lessons, error } = await admin

    .from("lessons")

    .select("id, title, course_id")

    .eq("status", "published")

    .is("video_asset_id", null)

    .order("updated_at", { ascending: true })

    .limit(MAX_LESSONS_PER_RUN);



  if (error) {

    return { skipped: true, reason: error.message, lessonsQueued: 0, placeholdersRetried: 0, tasks: [] };

  }



  const rows = lessons ?? [];

  const tasks: { lessonId: string; taskId: string; ok: boolean }[] = [];



  for (const lesson of rows) {

    const task = await enqueueAiTask({

      taskType: "video-producer",

      payload: { lesson_id: lesson.id, title: lesson.title },

      priority: 1,

    });

    const result = await dispatchAiTask(task.id);

    tasks.push({ lessonId: lesson.id, taskId: task.id, ok: result.ok });

  }



  let placeholdersRetried = 0;

  const placeholderIds = await findPlaceholderVideoAssetIds(20);

  for (const assetId of placeholderIds.slice(0, MAX_PLACEHOLDER_RETRIES)) {

    const result = await retryVideoRender(assetId);

    if (result.ok) placeholdersRetried += 1;

  }



  if (!rows.length && placeholdersRetried === 0) {

    return {

      skipped: true,

      reason: "all_lessons_have_video",

      lessonsQueued: 0,

      placeholdersRetried: 0,

      tasks: [],

    };

  }



  return {

    skipped: false,

    lessonsQueued: rows.length,

    placeholdersRetried,

    tasks,

  };

}


