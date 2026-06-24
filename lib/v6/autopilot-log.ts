import { createServiceRoleClient } from "@/lib/supabase/service";

export type AutopilotJobSlug =
  | "hourly_pubmed_monitor"
  | "daily_regulatory_monitor"
  | "daily_autopublish"
  | "weekly_trend_analysis"
  | "monthly_guideline_update";

export async function startAutopilotRun(jobSlug: AutopilotJobSlug) {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("autopilot_runs")
    .insert({ job_slug: jobSlug, status: "started" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function finishAutopilotRun(
  runId: string,
  jobSlug: AutopilotJobSlug,
  payload: {
    status: "ok" | "partial" | "error";
    items_processed?: number;
    items_created?: number;
    details?: Record<string, unknown>;
    error_message?: string;
  }
) {
  const admin = createServiceRoleClient();
  const details = { ...(payload.details ?? {}), job_slug: jobSlug };
  await admin
    .from("autopilot_runs")
    .update({
      status: payload.status,
      finished_at: new Date().toISOString(),
      items_processed: payload.items_processed ?? 0,
      items_created: payload.items_created ?? 0,
      details,
      error_message: payload.error_message ?? null,
    })
    .eq("id", runId);

  await admin
    .from("autopilot_cron_jobs")
    .update({
      last_run_at: new Date().toISOString(),
      last_status: payload.status,
    })
    .eq("slug", jobSlug);
}

export async function createAutopilotAlert(input: {
  alert_type: "new_study" | "new_drug" | "legislation" | "guideline" | "trend";
  title: string;
  summary?: string;
  source_type?: string;
  source_id?: string;
  article_id?: string;
  severity?: "info" | "warning" | "critical";
  metadata?: Record<string, unknown>;
}) {
  const admin = createServiceRoleClient();
  await admin.from("autopilot_alerts").insert({
    alert_type: input.alert_type,
    title: input.title,
    summary: input.summary ?? null,
    source_type: input.source_type ?? null,
    source_id: input.source_id ?? null,
    article_id: input.article_id ?? null,
    severity: input.severity ?? "info",
    metadata: input.metadata ?? {},
  });
}

export async function getAutopilotSettings() {
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("autopilot_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  return data;
}
