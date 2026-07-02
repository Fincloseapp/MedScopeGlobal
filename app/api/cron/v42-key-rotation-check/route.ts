import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runKeyRotationCheck } from "@/lib/v42/key-rotation/monitor";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const report = await runKeyRotationCheck();
  return NextResponse.json({
    ok: true,
    phase: "v42-key-rotation-check",
    alerts: report.alerts,
    keys: report.keys,
    checked_at: report.checked_at,
  });
}
