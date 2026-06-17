import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { processQueuedTasks } from "@/lib/academy/ai/workflow";
import { generateWeeklyDigest, persistWeeklyDigest } from "@/lib/academy/marketing/weekly-digest";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const { processed, results } = await processQueuedTasks(10);
  const digest = await generateWeeklyDigest();
  const digestId = await persistWeeklyDigest(digest);

  const admin = createServiceRoleClient();
  if (digestId) {
    await admin
      .from("marketing_events")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", digestId);
  }

  return NextResponse.json({
    ok: true,
    phase: "v35.0-weekly",
    tasksProcessed: processed,
    taskResults: results,
    digestId,
    digestItems: digest.items.length,
    digestSubject: digest.subject,
    generatedAt: digest.generatedAt,
  });
}
