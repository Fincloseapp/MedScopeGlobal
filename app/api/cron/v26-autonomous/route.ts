import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runV26AutonomousEngine } from "@/lib/v26/autonomous-engine";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const skipDeploy = url.searchParams.get("skipDeploy") === "1" || process.env.VERCEL === "1";

  const result = await runV26AutonomousEngine({
    skipDeploy,
    rewriteBatch: Number(url.searchParams.get("rewriteBatch") ?? 6),
  });

  return NextResponse.json(result);
}
