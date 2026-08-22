import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runMeDipacientReminderDigest } from "@/lib/medipacient/reminders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;
  const result = await runMeDipacientReminderDigest();
  return NextResponse.json({
    ok: true,
    job: "medipacient-reminders",
    ...result,
    generatedAt: new Date().toISOString(),
  });
}
