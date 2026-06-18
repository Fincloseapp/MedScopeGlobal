import { NextResponse } from "next/server";
import { getAutopilotStatus } from "@/lib/v32/autopilot/controller";
import { V32_UI_VERSION, V32_UI_BUILD_STAMP } from "@/lib/v32/version";

export const dynamic = "force-dynamic";

export async function GET() {
  let autopilot = {
    lastRun: null as unknown,
    pendingRepairs: 0,
    recentLogs: [] as unknown[],
    pendingTasks: [] as unknown[],
  };

  try {
    autopilot = await getAutopilotStatus();
  } catch {
    /* DB may be unavailable in edge cases */
  }

  return NextResponse.json({
    status: "ok",
    ok: true,
    version: V32_UI_VERSION,
    buildStamp: V32_UI_BUILD_STAMP,
    service: "medscope-v32-autopilot",
    autopilot: {
      status: autopilot.pendingRepairs > 0 ? "repairing" : "idle",
      lastRun: autopilot.lastRun,
      pendingRepairs: autopilot.pendingRepairs,
      pendingTasks: autopilot.pendingTasks,
    },
    cron: {
      hourly: "/api/cron/autopilot-hourly",
      daily: "/api/cron/autopilot-daily",
    },
    compat: {
      v30: "/api/v30/health",
      v31: "/api/v31/health",
      v29: "/api/v29/health",
    },
    generatedAt: new Date().toISOString(),
  });
}
