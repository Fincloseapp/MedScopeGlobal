"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAccess } from "@/lib/auth/require-admin-access";
import { runIngestionPipeline } from "@/lib/ingestion/pipeline";
import { isAiConfigured } from "@/lib/ingestion/ai";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function triggerIngestionNow() {
  const access = await requireAdminAccess();

  const result = await runIngestionPipeline({
    triggeredBy: `admin:${access.supabaseUserId ?? "gate"}`,
    maxArticles: Number(process.env.INGEST_MAX_ARTICLES ?? 80),
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/ingestion");
  revalidatePath("/admin/articles");

  return result;
}

export async function getIngestionStatus() {
  await requireAdminAccess();

  const admin = createServiceRoleClient();
  const [schedule, lastRuns] = await Promise.all([
    admin.from("ingestion_schedule").select("*").eq("id", 1).maybeSingle(),
    admin
      .from("ingestion_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(10),
  ]);

  return {
    aiEnabled: isAiConfigured(),
    schedule: schedule.data,
    runs: lastRuns.data ?? [],
  };
}

export async function updateIngestionSchedule(input: {
  enabled: boolean;
  intervalHours: number;
  maxPerRun: number;
}) {
  await requireAdminAccess();

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("ingestion_schedule")
    .update({
      enabled: input.enabled,
      interval_hours: input.intervalHours,
      max_articles_per_run: input.maxPerRun,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) throw error;
  revalidatePath("/admin/ingestion");
}
