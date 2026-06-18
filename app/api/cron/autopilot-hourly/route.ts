import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runAutopilot } from "@/lib/v32/autopilot/controller";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const result = await runAutopilot("hourly");
  return NextResponse.json({ ok: result.ok, mode: "hourly", ...result });
}
