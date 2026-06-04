import { generateJsonFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  finishAutopilotRun,
  getAutopilotSettings,
  startAutopilotRun,
  createAutopilotAlert,
} from "@/lib/v6/autopilot-log";

export async function runWeeklyTrendAnalysis() {
  const settings = await getAutopilotSettings();
  if (settings && !settings.trend_analysis_enabled) {
    return { skipped: true, reason: "trend_analysis_disabled" };
  }

  const runId = await startAutopilotRun("weekly_trend_analysis");
  const admin = createServiceRoleClient();

  const { data: articles } = await admin
    .from("medical_ai_texts")
    .select("id, title, categories, created_at")
    .eq("published", true)
    .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString())
    .limit(80);

  const { data: evidence } = await admin
    .from("medical_evidence")
    .select("evidence_level, study_type, article_id")
    .limit(200);

  const ra = (articles ?? []).filter((a) => {
    const c = a.categories as { diagnosis?: string[] };
    return c?.diagnosis?.includes("ra");
  }).length;

  const dmard = (articles ?? []).filter((a) => {
    const blob = JSON.stringify(a.categories ?? {}).toLowerCase();
    return blob.includes("dmard") || blob.includes("methotrexate");
  }).length;

  const bdmard = (articles ?? []).filter((a) => {
    const blob = JSON.stringify(a.categories ?? {}).toLowerCase();
    return blob.includes("bdmard") || blob.includes("adalimumab") || blob.includes("biologic");
  }).length;

  const metric = {
    ra_articles_7d: ra,
    dmard_mentions_7d: dmard,
    bdmard_mentions_7d: bdmard,
    evidence_a: (evidence ?? []).filter((e) => e.evidence_level === "A").length,
    evidence_b: (evidence ?? []).filter((e) => e.evidence_level === "B").length,
    total_articles_7d: articles?.length ?? 0,
  };

  let narrative = `Týdenní trend RA: ${ra} článků, DMARDs: ${dmard}, bDMARDs: ${bdmard}.`;
  if (isLlmConfigured()) {
    const raw = await generateJsonFromLlm({
      system: "Jsi epidemiolog revmatologie. Vrať JSON { \"narrative\": \"...\" } v češtině.",
      user: `Metriky: ${JSON.stringify(metric)}`,
      maxTokens: 500,
    });
    if (raw) {
      try {
        const p = JSON.parse(raw) as { narrative?: string };
        if (p.narrative) narrative = p.narrative;
      } catch {
        /* keep default */
      }
    }
  }

  const periodEnd = new Date();
  const periodStart = new Date(Date.now() - 7 * 86400000);

  await admin.from("autopilot_trends").insert({
    trend_key: "ra_dmard_bdmard_weekly",
    period_start: periodStart.toISOString().slice(0, 10),
    period_end: periodEnd.toISOString().slice(0, 10),
    metric,
    narrative,
  });

  await createAutopilotAlert({
    alert_type: "trend",
    title: "Týdenní trend analýza RA / DMARD / bDMARD",
    summary: narrative.slice(0, 400),
    metadata: metric,
  });

  await finishAutopilotRun(runId, "weekly_trend_analysis", {
    status: "ok",
    items_processed: articles?.length ?? 0,
    items_created: 1,
    details: { metric },
  });

  return { ok: true, metric, narrative };
}
