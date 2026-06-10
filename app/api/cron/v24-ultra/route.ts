import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { runV24UltraCron } from "@/lib/v24/cron";
import { seedV24Quizzes } from "@/lib/v24/quizzes";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const section = url.searchParams.get("section") ?? undefined;

  const result = await runV24UltraCron(section);
  if (!section || section === "quizzes") {
    try {
      await seedV24Quizzes();
    } catch {
      /* optional */
    }
  }

  return NextResponse.json({ ok: true, ...result });
}
