import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runInlineNavMonitor } from "@/lib/v25/runners/post-pipeline";
import { setCronStatus } from "@/lib/v25/system-state";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const t0 = Date.now();
  const result = await runInlineNavMonitor();
  setCronStatus(
    "v25-nav-monitor",
    result.ok ? "ok" : "fail",
    Date.now() - t0,
    result.ok ? undefined : `${result.broken} failures`
  );

  return NextResponse.json(result);
}
