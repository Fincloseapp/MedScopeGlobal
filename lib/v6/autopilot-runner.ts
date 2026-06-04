import { runDailyAutopublish } from "@/lib/ai/autopublish";
import { runMonthlyGuidelineUpdate } from "@/lib/v6/guideline-update";
import { runHourlyPubmedMonitor } from "@/lib/v6/monitor-pubmed";
import { runDailyRegulatoryMonitor } from "@/lib/v6/monitor-regulatory";
import { runWeeklyTrendAnalysis } from "@/lib/v6/trend-analysis";
import {
  finishAutopilotRun,
  getAutopilotSettings,
  startAutopilotRun,
} from "@/lib/v6/autopilot-log";

export async function runDailyAutopublishJob() {
  const settings = await getAutopilotSettings();
  if (settings && !settings.autopublish_enabled) {
    return { skipped: true, reason: "autopublish_disabled" };
  }

  const runId = await startAutopilotRun("daily_autopublish");
  try {
    const result = await runDailyAutopublish();
    await finishAutopilotRun(runId, {
      status: result.errors.length ? "partial" : "ok",
      items_processed: result.published + result.errors.length,
      items_created: result.published,
      details: { job_slug: "daily_autopublish", ...result },
    });
    return { ok: true, ...result };
  } catch (e) {
    await finishAutopilotRun(runId, {
      status: "error",
      error_message: (e as Error).message,
      details: { job_slug: "daily_autopublish" },
    });
    throw e;
  }
}
