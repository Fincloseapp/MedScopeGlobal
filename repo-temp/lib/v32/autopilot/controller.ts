import { createServiceRoleClient } from "@/lib/supabase/service";
import { logAiEvent } from "@/lib/academy/ai/controller";
import { runAutopilotMonitor } from "@/lib/v32/autopilot/monitor";
import { runAutopilotRepair } from "@/lib/v32/autopilot/repair";
import { runContentPipeline } from "@/lib/v32/autopilot/content-pipeline";
import { runSeoAudit } from "@/lib/v32/autopilot/seo-audit";
import { runSecurityAudit } from "@/lib/v32/autopilot/security-audit";

export type AutopilotRunMode = "hourly" | "daily";

export async function runAutopilot(mode: AutopilotRunMode) {
  const startedAt = new Date().toISOString();
  await logAiEvent({
    worker: "autopilot-controller",
    message: `Autopilot ${mode} started`,
    payload: { mode, startedAt },
  });

  const monitor = await runAutopilotMonitor();
  let repair = { ok: true, tasksCreated: 0, tasksProcessed: 0 };
  let content = { ok: true, articlesGenerated: 0 };
  let seo = { ok: true, issues: 0 };
  let security = { ok: true, findings: 0 };

  if (!monitor.ok) {
    repair = await runAutopilotRepair(monitor.failures);
  }

  if (mode === "daily") {
    content = await runContentPipeline();
    seo = await runSeoAudit();
    security = await runSecurityAudit();
  }

  const result = {
    ok: monitor.ok && repair.ok && content.ok && seo.ok && security.ok,
    mode,
    startedAt,
    finishedAt: new Date().toISOString(),
    monitor,
    repair,
    content,
    seo,
    security,
  };

  await logAiEvent({
    worker: "autopilot-controller",
    level: result.ok ? "info" : "warn",
    message: `Autopilot ${mode} finished`,
    payload: result,
  });

  try {
    const admin = createServiceRoleClient();
    await admin.from("ai_logs").insert({
      worker: "autopilot-controller",
      level: result.ok ? "info" : "warn",
      message: `autopilot:${mode}:complete`,
      payload: result,
    });
  } catch {
    /* ignore */
  }

  return result;
}

export async function getAutopilotStatus() {
  const admin = createServiceRoleClient();

  const [logsRes, tasksRes] = await Promise.all([
    admin
      .from("ai_logs")
      .select("id, worker, level, message, created_at")
      .eq("worker", "autopilot-controller")
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("ai_tasks")
      .select("id, task_type, status, created_at")
      .ilike("task_type", "%repair%")
      .in("status", ["queued", "running"])
      .limit(10),
  ]);

  const lastRun = logsRes.data?.[0] ?? null;
  const pendingRepairs = tasksRes.data?.length ?? 0;

  return {
    lastRun,
    pendingRepairs,
    recentLogs: logsRes.data ?? [],
    pendingTasks: tasksRes.data ?? [],
  };
}
