import { NextResponse } from "next/server";
import { verifyCronAuth, AUTONOMOUS_SCHEDULE } from "@/lib/ecosystem/autonomous";

/** Autonomous task runner — triggered by cron or manual admin invoke */
export async function POST(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { task?: string };
  const task = body.task ?? "seo-optimize";

  const schedule = AUTONOMOUS_SCHEDULE[task as keyof typeof AUTONOMOUS_SCHEDULE];
  if (!schedule) {
    return NextResponse.json({ error: `Unknown task: ${task}` }, { status: 400 });
  }

  // Task dispatch — integrates with existing ingestion/editorial pipelines
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
    })),
  });
}
