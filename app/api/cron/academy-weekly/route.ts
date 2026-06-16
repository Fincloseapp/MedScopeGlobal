import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { processQueuedTasks } from "@/lib/academy/ai/workflow";
import { listAiScenarios } from "@/lib/academy/db";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const { processed, results } = await processQueuedTasks(10);
  const scenarios = await listAiScenarios(5);

  const admin = createServiceRoleClient();
  await admin.from("marketing_events").insert({
    event_type: "academy_weekly_digest",
    status: "sent",
    payload: { scenariosCount: scenarios.length, tasksProcessed: processed },
  });

  return NextResponse.json({
    ok: true,
    phase: "v35.0-weekly",
    tasksProcessed: processed,
    taskResults: results,
    scenariosCount: scenarios.length,
    generatedAt: new Date().toISOString(),
  });
}
