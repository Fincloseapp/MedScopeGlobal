import { NextResponse } from "next/server";

import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runExpertReviewCron } from "@/lib/academy/ai/expert-review-cron";
import { processQueuedTasks } from "@/lib/academy/ai/workflow";
import { deliverWeeklyDigest } from "@/lib/academy/marketing/digest-delivery";
import { generateWeeklyDigest, persistWeeklyDigest } from "@/lib/academy/marketing/weekly-digest";
import { isExpertReviewAutoPublishEnabled } from "@/lib/academy/settings";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const { processed, results } = await processQueuedTasks(10);
  const expertReview = await runExpertReviewCron();
  const digest = await generateWeeklyDigest();
  const digestId = await persistWeeklyDigest(digest);

  let delivery: Awaited<ReturnType<typeof deliverWeeklyDigest>> = { sent: false, mode: "log" };
  if (digestId) {
    delivery = await deliverWeeklyDigest(digest, digestId);
  }

  const admin = createServiceRoleClient();
  if (digestId) {
    await admin
      .from("marketing_events")
      .update({
        status: delivery.sent ? "sent" : "pending",
        payload: { ...digest, delivery },
        updated_at: new Date().toISOString(),
      })
      .eq("id", digestId);
  }

  return NextResponse.json({
    ok: true,
    phase: "v35.0-weekly-phase13",
    tasksProcessed: processed,
    taskResults: results,
    expertReview,
    expertReviewAutoPublish: isExpertReviewAutoPublishEnabled(),
    digestId,
    digestItems: digest.items.length,
    digestSubject: digest.subject,
    deliveryMode: delivery.mode,
    deliverySent: delivery.sent,
    generatedAt: digest.generatedAt,
  });
}
