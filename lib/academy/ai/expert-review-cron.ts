import { dispatchAiTask, enqueueAiTask } from "@/lib/academy/ai/controller";
import { isExpertReviewAutoPublishEnabled } from "@/lib/academy/settings";
import { isLlmConfigured } from "@/lib/ai/chat-json";
import { createServiceRoleClient } from "@/lib/supabase/service";

export type ExpertReviewCronResult = {
  skipped: boolean;
  reason?: string;
  autoPublish: boolean;
  queued: { target: string; id: string; taskId: string; ok: boolean }[];
};

const MAX_PER_RUN = 5;

/** Queue expert-review for draft AI-generated courses/lessons; auto-publish when enabled. */
export async function runExpertReviewCron(): Promise<ExpertReviewCronResult> {
  const autoPublish = isExpertReviewAutoPublishEnabled();

  if (!isLlmConfigured()) {
    return { skipped: true, reason: "no_llm_key", autoPublish, queued: [] };
  }

  const admin = createServiceRoleClient();
  const queued: ExpertReviewCronResult["queued"] = [];

  const { data: draftCourses } = await admin
    .from("courses")
    .select("id, title, metadata")
    .eq("status", "draft")
    .order("created_at", { ascending: true })
    .limit(MAX_PER_RUN);

  for (const course of draftCourses ?? []) {
    const meta = (course.metadata ?? {}) as Record<string, unknown>;
    if (meta.expert_review_queued) continue;
    if (!meta.ai_generated && !meta.generated_by_ai) continue;

    const task = await enqueueAiTask({
      taskType: "expert-review",
      payload: { course_id: course.id, auto_publish: autoPublish, min_score: 75 },
      priority: 1,
    });

    await admin
      .from("courses")
      .update({
        metadata: { ...meta, expert_review_queued: true, expert_review_task_id: task.id },
      })
      .eq("id", course.id);

    const result = await dispatchAiTask(task.id);
    queued.push({ target: "course", id: course.id, taskId: task.id, ok: result.ok });
  }

  if (queued.length >= MAX_PER_RUN) {
    return { skipped: false, autoPublish, queued };
  }

  const remaining = MAX_PER_RUN - queued.length;
  const { data: draftLessons } = await admin
    .from("lessons")
    .select("id, title, metadata")
    .eq("status", "draft")
    .order("created_at", { ascending: true })
    .limit(remaining);

  for (const lesson of draftLessons ?? []) {
    const meta = (lesson.metadata ?? {}) as Record<string, unknown>;
    if (meta.expert_review_queued) continue;
    if (!meta.ai_generated && !meta.generated_by_ai) continue;

    const task = await enqueueAiTask({
      taskType: "expert-review",
      payload: { lesson_id: lesson.id, auto_publish: autoPublish, min_score: 75 },
      priority: 1,
    });

    await admin
      .from("lessons")
      .update({
        metadata: { ...meta, expert_review_queued: true, expert_review_task_id: task.id },
      })
      .eq("id", lesson.id);

    const result = await dispatchAiTask(task.id);
    queued.push({ target: "lesson", id: lesson.id, taskId: task.id, ok: result.ok });
  }

  return { skipped: queued.length === 0, reason: queued.length === 0 ? "no_draft_ai_content" : undefined, autoPublish, queued };
}
