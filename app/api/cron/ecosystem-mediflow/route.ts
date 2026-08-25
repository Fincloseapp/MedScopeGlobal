import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { resetMediFlowSupplementsDaily } from "@/lib/mediflow/store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Daily MediFlow maintenance — wired from cloudflare-cron.yml and /api/ecosystem/autonomous */
async function runMediFlowDailyReset() {
  const result = await resetMediFlowSupplementsDaily();
  return {
    ok: true,
    task: "mediflow-daily-reset",
    ...result,
    timestamp: new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  try {
    return NextResponse.json(await runMediFlowDailyReset());
  } catch (err) {
    const message = err instanceof Error ? err.message : "MediFlow cron failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
