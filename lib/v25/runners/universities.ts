import { spawnSync } from "node:child_process";
import { projectPath } from "@/lib/config/paths";
import { fetchAllFacultiesLive } from "@/lib/v25/universities-fetch";
import {
  loadUniversitiesReportAsync,
  persistUniversitiesReport,
} from "@/lib/v25/universities";
import { mergeV25SystemState, setCronStatus } from "@/lib/v25/system-state";

export async function runUniversitiesFetch() {
  if (process.env.VERCEL === "1") {
    const previous = await loadUniversitiesReportAsync();
    const report = await fetchAllFacultiesLive(previous);
    const persisted = await persistUniversitiesReport(report);

    setCronStatus(
      "v25-universities",
      report.totals.failed === 0 ? "ok" : "fail",
      undefined,
      report.totals.failed ? `${report.totals.failed} faculties failed` : undefined,
      report.totals
    );
    mergeV25SystemState({
      universities: report,
      providers: [
        {
          id: "universities",
          name: "České LF",
          status: report.totals.failed === 0 ? "ok" : "partial",
          lastRunAt: report.at,
          newItems: report.totals.newArticles,
          updates: report.totals.updates,
          errors: report.totals.failed,
        },
      ],
    });

    return {
      ok: report.totals.ok > 0 && persisted,
      fetched: report.totals.fetched,
      detail: `${report.totals.ok}/${report.totals.fetched} OK`,
    };
  }

  const script = projectPath("lib/v25/providers/universities-provider.mjs");
  const result = spawnSync(process.execPath, [script], { encoding: "utf8", timeout: 180000 });
  const report = await loadUniversitiesReportAsync();
  if (report) await persistUniversitiesReport(report);
  return {
    ok: result.status === 0,
    fetched: report?.totals.fetched ?? 0,
    detail: report ? `${report.totals.ok}/${report.totals.fetched} OK` : undefined,
  };
}
