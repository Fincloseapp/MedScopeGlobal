import { createServiceRoleClient } from "@/lib/supabase/service";
import { logAiEvent } from "@/lib/academy/ai/controller";

export type ExpertType = "clinical" | "pedagogy" | "pharmacology" | "anatomy";

export async function requestExpertReview(opts: {
  taskId: string;
  expertType: ExpertType;
  contentSummary: string;
}): Promise<{ id: string; status: string }> {
  const admin = createServiceRoleClient();

  const { data, error } = await admin
    .from("ai_expert_reviews")
    .insert({
      task_id: opts.taskId,
      expert_type: opts.expertType,
      status: "pending",
      feedback: null,
      metadata: { content_summary: opts.contentSummary, stub: true },
    })
    .select("id, status")
    .single();

  if (error) throw new Error(error.message);

  await logAiEvent({
    taskId: opts.taskId,
    worker: `expert:${opts.expertType}`,
    message: "Expert review requested (stub)",
  });

  return data as { id: string; status: string };
}

/** Phase 1 stub — auto-approves with placeholder feedback */
export async function runExpertReviewStub(reviewId: string): Promise<void> {
  const admin = createServiceRoleClient();

  await admin
    .from("ai_expert_reviews")
    .update({
      status: "approved",
      score: 4.5,
      feedback: "Fáze 1: automatické schválení stubu. Plná expert review ve fázi 2.",
    })
    .eq("id", reviewId);

  await logAiEvent({
    worker: "expert-review",
    message: `Review ${reviewId} auto-approved (stub)`,
  });
}
