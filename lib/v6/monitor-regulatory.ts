import {
  upsertMedicalSourceFromRegulatory,
  type RegulatoryAgency,
} from "@/lib/v5plus/regulatory-fetch";
import {
  createAutopilotAlert,
  finishAutopilotRun,
  getAutopilotSettings,
  startAutopilotRun,
} from "@/lib/v6/autopilot-log";

const WATCH: { name: string; agency: RegulatoryAgency }[] = [
  { name: "methotrexate", agency: "fda" },
  { name: "adalimumab", agency: "ema" },
  { name: "tocilizumab", agency: "fda" },
  { name: "rituximab", agency: "sukl" },
  { name: "tofacitinib", agency: "sukl" },
];

export async function runDailyRegulatoryMonitor() {
  const settings = await getAutopilotSettings();
  if (settings && !settings.regulatory_monitor_enabled) {
    return { skipped: true, reason: "regulatory_monitor_disabled" };
  }

  const runId = await startAutopilotRun("daily_regulatory_monitor");
  const errors: string[] = [];
  let created = 0;

  try {
    for (const { name, agency } of WATCH) {
      try {
        const r = await upsertMedicalSourceFromRegulatory(name, agency);
        if (r?.id) {
          created++;
          await createAutopilotAlert({
            alert_type: "new_drug",
            title: `${agency.toUpperCase()}: ${name}`,
            summary: r.info.summary?.slice(0, 300),
            source_type: agency,
            source_id: r.id,
            metadata: { drug: name, agency },
          });
        }
        await new Promise((res) => setTimeout(res, 400));
      } catch (e) {
        errors.push(`${agency}/${name}: ${(e as Error).message}`);
      }
    }

    await finishAutopilotRun(runId, "daily_regulatory_monitor", {
      status: errors.length ? "partial" : "ok",
      items_processed: WATCH.length,
      items_created: created,
      details: { errors },
    });
    return { ok: true, created, errors };
  } catch (e) {
    await finishAutopilotRun(runId, "daily_regulatory_monitor", {
      status: "error",
      error_message: (e as Error).message,
    });
    throw e;
  }
}
