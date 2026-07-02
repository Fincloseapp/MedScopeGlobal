import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runAcademyAutorepair } from "@/lib/academy/ai/autorepair";
import { getAcademyCounts } from "@/lib/academy/db";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const [repair, counts] = await Promise.all([runAcademyAutorepair(), getAcademyCounts()]);

  return NextResponse.json({
    ok: repair.ok,
    phase: "v35.0-monthly-audit",
    counts,
    autorepair: repair,
    generatedAt: new Date().toISOString(),
  });
}
