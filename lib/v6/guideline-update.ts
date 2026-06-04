import { generateJsonFromLlm, isLlmConfigured } from "@/lib/ai/chat-json";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  createAutopilotAlert,
  finishAutopilotRun,
  getAutopilotSettings,
  startAutopilotRun,
} from "@/lib/v6/autopilot-log";
import { runAutopublishFromSource } from "@/lib/ai/autopublish";

export async function runMonthlyGuidelineUpdate() {
  const settings = await getAutopilotSettings();
  if (settings && !settings.guideline_update_enabled) {
    return { skipped: true, reason: "guideline_update_disabled" };
  }

  const runId = await startAutopilotRun("monthly_guideline_update");
  const admin = createServiceRoleClient();

  const topics = [
    {
      title: "EULAR doporučení — revmatoidní artritida (přehled)",
      source: "EULAR",
      specialty: "rheumatology" as const,
    },
    {
      title: "ČLS JEP — revmatologie, aktualizace praxe",
      source: "ČLS JEP",
      specialty: "rheumatology" as const,
    },
  ];

  let created = 0;
  const errors: string[] = [];

  for (const topic of topics) {
    try {
      let body = `<p>Měsíční přehled guideline: ${topic.title}.</p>`;
      if (isLlmConfigured()) {
        const raw = await generateJsonFromLlm({
          system: "Medicínský editor. JSON: { \"content_cs\": \"HTML\", \"summary_clinician\": \"...\" }",
          user: `Napiš stručný guideline přehled: ${topic.title}`,
          maxTokens: 1200,
        });
        if (raw) {
          const p = JSON.parse(raw) as { content_cs?: string; summary_clinician?: string };
          if (p.content_cs) body = p.content_cs;
        }
      }

      if (settings?.autopublish_enabled !== false) {
        const r = await runAutopublishFromSource({
          title: topic.title,
          content_cs: body,
          summary_clinician: `Guideline update — ${topic.source}`,
          source_name: topic.source,
          source_url: `https://www.eular.org/`,
          specialty: topic.specialty,
          categories: { diagnosis: ["ra"], study_type: "guideline" },
        });
        if (r.articleId) created++;
      }

      await createAutopilotAlert({
        alert_type: "guideline",
        title: topic.title,
        summary: `Měsíční aktualizace — ${topic.source}`,
        metadata: { source: topic.source },
      });
    } catch (e) {
      errors.push((e as Error).message);
    }
  }

  await admin.from("autopilot_settings").update({ updated_at: new Date().toISOString() }).eq("id", "default");

  await finishAutopilotRun(runId, {
    status: errors.length ? "partial" : "ok",
    items_processed: topics.length,
    items_created: created,
    details: { job_slug: "monthly_guideline_update", errors },
  });

  return { ok: true, created, errors };
}
