import type { AutopilotJobSlug } from "@/lib/v6/autopilot-log";
import { runDailyAutopublishJob } from "@/lib/v6/autopilot-runner";
import { runMonthlyGuidelineUpdate } from "@/lib/v6/guideline-update";
import { runHourlyPubmedMonitor } from "@/lib/v6/monitor-pubmed";
import { runDailyRegulatoryMonitor } from "@/lib/v6/monitor-regulatory";
import { runWeeklyTrendAnalysis } from "@/lib/v6/trend-analysis";

const JOBS: AutopilotJobSlug[] = [
  "hourly_pubmed_monitor",
  "daily_regulatory_monitor",
  "daily_autopublish",
  "weekly_trend_analysis",
  "monthly_guideline_update",
];

export function isAutopilotJobSlug(s: string): s is AutopilotJobSlug {
  return (JOBS as string[]).includes(s);
}

export async function runAutopilotJob(slug: AutopilotJobSlug) {
  switch (slug) {
    case "hourly_pubmed_monitor":
      return runHourlyPubmedMonitor();
    case "daily_regulatory_monitor":
      return runDailyRegulatoryMonitor();
    case "daily_autopublish":
      return runDailyAutopublishJob();
    case "weekly_trend_analysis":
      return runWeeklyTrendAnalysis();
    case "monthly_guideline_update":
      return runMonthlyGuidelineUpdate();
    default:
      throw new Error(`Unknown job: ${slug}`);
  }
}

export { JOBS as AUTOPILOT_JOB_SLUGS };
