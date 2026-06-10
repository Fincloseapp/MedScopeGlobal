import { createServiceRoleClient } from "@/lib/supabase/service";
import type { V25SystemState } from "@/lib/v25/types";

const SNAPSHOT_ID = "production";

export async function persistV25SystemStateToDb(state: V25SystemState): Promise<void> {
  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from("v25_system_snapshot").upsert({
      id: SNAPSHOT_ID,
      state,
      updated_at: new Date().toISOString(),
    });
    if (error) console.error("[v25] persist state:", error.message);
  } catch (e) {
    console.error("[v25] persist state failed", e);
  }
}

export async function loadV25SystemStateFromDb(): Promise<V25SystemState | null> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("v25_system_snapshot")
      .select("state")
      .eq("id", SNAPSHOT_ID)
      .maybeSingle();
    if (error || !data?.state) return null;
    return data.state as V25SystemState;
  } catch {
    return null;
  }
}
