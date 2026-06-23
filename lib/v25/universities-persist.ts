import { writeV25Json } from "@/lib/v25/data-store";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { V25UniversitiesReport } from "@/lib/v25/universities";

const SNAPSHOT_ID = "production";

export async function persistUniversitiesReport(report: V25UniversitiesReport): Promise<boolean> {
  writeV25Json("v25/universities/index.json", report);
  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("v25_universities_snapshot").upsert({
      id: SNAPSHOT_ID,
      report,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("[v25] universities persist:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[v25] universities persist failed", e);
    return false;
  }
}

export async function loadUniversitiesReportFromDb(): Promise<V25UniversitiesReport | null> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("v25_universities_snapshot")
      .select("report")
      .eq("id", SNAPSHOT_ID)
      .maybeSingle();
    if (error || !data?.report) return null;
    return data.report as V25UniversitiesReport;
  } catch {
    return null;
  }
}
