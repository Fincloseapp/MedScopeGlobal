import { createClient } from "@/lib/supabase/server";

export async function getAutopilotRuns(limit = 30) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("autopilot_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAutopilotCronJobs() {
  const supabase = await createClient();
  const { data } = await supabase.from("autopilot_cron_jobs").select("*").order("slug");
  return data ?? [];
}

export async function getAutopilotSettings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("autopilot_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  return data;
}
