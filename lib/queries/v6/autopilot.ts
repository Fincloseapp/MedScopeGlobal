import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

export async function getAutopilotRuns(limit = 30) {
  const supabase = tryCreateServiceRoleClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("autopilot_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getAutopilotCronJobs() {
  const supabase = tryCreateServiceRoleClient();
  if (!supabase) return [];
  const { data } = await supabase.from("autopilot_cron_jobs").select("*").order("slug");
  return data ?? [];
}

export async function getAutopilotSettings() {
  const supabase = tryCreateServiceRoleClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("autopilot_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  return data;
}
