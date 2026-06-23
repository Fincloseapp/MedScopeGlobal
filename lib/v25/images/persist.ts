import { writeV25Json, readV25Json } from "@/lib/v25/data-store";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { V25ImageFixRecord, V25ImageRecord, V25ImageReport } from "@/lib/v25/images/types";

const SNAPSHOT_ID = "production";
const REGISTRY_PATH = "images/registry.json";
const FIX_LOG_PATH = "images/fix-log.json";

export function loadImageRegistryLocal(): V25ImageRecord[] {
  const data = readV25Json<{ images?: V25ImageRecord[] }>(REGISTRY_PATH);
  return data?.images ?? [];
}

export function saveImageRegistryLocal(images: V25ImageRecord[]) {
  writeV25Json(REGISTRY_PATH, { at: new Date().toISOString(), images });
}

export function appendImageFixLog(entry: Omit<V25ImageFixRecord, "id" | "at">) {
  const log = readV25Json<V25ImageFixRecord[]>(FIX_LOG_PATH) ?? [];
  const record: V25ImageFixRecord = {
    id: `imgfix-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    ...entry,
  };
  writeV25Json(FIX_LOG_PATH, [record, ...log].slice(0, 500));
  return record;
}

export async function persistImageReport(report: V25ImageReport): Promise<boolean> {
  writeV25Json("v25/images/report.json", report);
  saveImageRegistryLocal(report.images);
  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("v25_images_snapshot").upsert({
      id: SNAPSHOT_ID,
      report,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("[v25] images persist:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[v25] images persist failed", e);
    return false;
  }
}

export async function loadImageReportFromDb(): Promise<V25ImageReport | null> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("v25_images_snapshot")
      .select("report")
      .eq("id", SNAPSHOT_ID)
      .maybeSingle();
    if (error || !data?.report) return null;
    return data.report as V25ImageReport;
  } catch {
    return null;
  }
}

export async function loadImageReportAsync(): Promise<V25ImageReport | null> {
  const fromDb = await loadImageReportFromDb();
  if (fromDb) return fromDb;
  return readV25Json<V25ImageReport>("v25/images/report.json");
}

export function loadImageFixLogLocal(): V25ImageFixRecord[] {
  return readV25Json<V25ImageFixRecord[]>(FIX_LOG_PATH) ?? [];
}

export async function logImageRunToDb(
  section: string,
  slug: string,
  source: string,
  ok: boolean,
  detail?: string
) {
  try {
    const supabase = createServiceRoleClient();
    await supabase.from("v25_image_runs").insert({
      section,
      slug,
      source,
      ok,
      detail: detail ?? null,
    });
  } catch {
    /* optional */
  }
}
