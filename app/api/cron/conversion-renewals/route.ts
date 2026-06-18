import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runConversionRenewals } from "@/lib/v38/conversion-engine";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const result = await runConversionRenewals();
  return NextResponse.json({
    ok: result.ok,
    phase: "v38.0-conversion-renewals",
    ...result,
    generatedAt: new Date().toISOString(),
  });
}
