import { V24_SECTIONS } from "@/lib/v24/sections";
import { runV24SectionBatch } from "@/lib/v24/orchestrator";
import { recordCronHealth } from "@/lib/v24/engines/monitoring";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { V24_ENGINE_VERSION } from "@/lib/v24/version";
import { runV25PostPipeline } from "@/lib/v25/orchestrator";

export async function runV24UltraCron(sectionFilter?: string) {
  const t0 = Date.now();
  const sections = sectionFilter
    ? V24_SECTIONS.filter((s) => s.id === sectionFilter || s.cronId === sectionFilter)
    : V24_SECTIONS;

  const summary: Record<string, { generated: number; failed: number }> = {};
  const errors: string[] = [];

  for (const sec of sections) {
    const st = Date.now();
    try {
      const batch = await runV24SectionBatch(sec.id);
      summary[sec.id] = { generated: batch.generated, failed: batch.failed };
      recordCronHealth({
        cronId: sec.cronId,
        status: batch.failed ? "partial" : "ok",
        durationMs: Date.now() - st,
        metrics: { generated: batch.generated, failed: batch.failed },
      });
    } catch (e) {
      const msg = (e as Error).message;
      errors.push(`${sec.id}: ${msg}`);
      summary[sec.id] = { generated: 0, failed: 1 };
      recordCronHealth({
        cronId: sec.cronId,
        status: "error",
        durationMs: Date.now() - st,
        metrics: { generated: 0, failed: 1 },
        error: msg,
      });
    }
  }

  try {
    const admin = createServiceRoleClient();
    await admin.from("v24_cron_runs").insert({
      cron_id: "v24-ultra",
      status: errors.length ? "partial" : "ok",
      metrics: summary,
      error: errors.length ? errors.join("; ") : null,
      started_at: new Date(t0).toISOString(),
      finished_at: new Date().toISOString(),
    });
  } catch {
    /* table may not exist yet */
  }

  let enterprise;
  try {
    enterprise = await runV25PostPipeline();
  } catch {
    /* optional v25 layer */
  }

  return {
    version: V24_ENGINE_VERSION,
    sections: summary,
    errors,
    durationMs: Date.now() - t0,
    enterprise,
  };
}
