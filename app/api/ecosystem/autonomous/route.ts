import { NextResponse } from "next/server";
import { verifyCronAuth, AUTONOMOUS_SCHEDULE } from "@/lib/ecosystem/autonomous";
import { resetMediFlowSupplementsDaily } from "@/lib/mediflow/store";

/** Autonomous task runner — triggered by cron or manual admin invoke */
export async function POST(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { task?: string };
  const task = body.task ?? "seo-optimize";

  const schedule = AUTONOMOUS_SCHEDULE[task as keyof typeof AUTONOMOUS_SCHEDULE];
  if (!schedule) {
    return NextResponse.json({ error: `Unknown task: ${task}` }, { status: 400 });
  }

  // MediFlow ecosystem — delegates to same logic as GET /api/cron/ecosystem-mediflow
  if (task === "mediflow-daily-reset") {
    try {
      const reset = await resetMediFlowSupplementsDaily();
      return NextResponse.json({
        task,
        status: "completed",
        description: schedule.description,
        cronEndpoint: "/api/cron/ecosystem-mediflow",
        ...reset,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "MediFlow reset failed";
      return NextResponse.json({ task, status: "error", error: message }, { status: 500 });
    }
  }

  // Other tasks — queued for existing ingestion/editorial pipelines
  const result = {
    task,
    status: "queued",
    description: schedule.description,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(result);
}

export async function GET() {
  return NextResponse.json({
    tasks: Object.entries(AUTONOMOUS_SCHEDULE).map(([id, config]) => ({
      id,
      ...config,
      cronEndpoint: id === "mediflow-daily-reset" ? "/api/cron/ecosystem-mediflow" : undefined,
    })),
  });
}
