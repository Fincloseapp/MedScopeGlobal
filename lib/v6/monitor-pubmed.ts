import { runDailyPubmedUpdate } from "@/lib/v5plus/daily-pubmed";
import {
  createAutopilotAlert,
  finishAutopilotRun,
  getAutopilotSettings,
  startAutopilotRun,
} from "@/lib/v6/autopilot-log";

export async function runHourlyPubmedMonitor() {
  const settings = await getAutopilotSettings();
  if (settings && !settings.pubmed_monitor_enabled) {
    return { skipped: true, reason: "pubmed_monitor_disabled" };
  }

  const runId = await startAutopilotRun("hourly_pubmed_monitor");
  try {
    const result = await runDailyPubmedUpdate();
    if (result.sources > 0) {
      await createAutopilotAlert({
        alert_type: "new_study",
        title: `PubMed monitor: ${result.sources} nových zdrojů`,
        summary: `Obohaceno ${result.enriched} článků.`,
        source_type: "pubmed",
        metadata: { errors: result.errors },
      });
    }
    await finishAutopilotRun(runId, "hourly_pubmed_monitor", {
      status: result.errors.length ? "partial" : "ok",
      items_processed: result.sources + result.enriched,
      items_created: result.sources,
      details: { ...result },
    });
    return { ok: true, ...result };
  } catch (e) {
    await finishAutopilotRun(runId, "hourly_pubmed_monitor", {
      status: "error",
      error_message: (e as Error).message,
    });
    throw e;
  }
}
