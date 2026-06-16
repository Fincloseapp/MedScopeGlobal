import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/v6/cron-auth";
import { checkAcademyTables, getAcademyCounts } from "@/lib/academy/db";
import { dispatchAiTask } from "@/lib/academy/ai/controller";
import { createServiceRoleClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: Request) {
  const denied = verifyCronRequest(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const runContentGen = url.searchParams.get("generate") === "1";

  const tables = await checkAcademyTables();
  const counts = await getAcademyCounts();

  let dispatched: { taskId: string; ok: boolean }[] = [];

  if (runContentGen) {
    const admin = createServiceRoleClient();
    const { data: queued } = await admin
      .from("ai_tasks")
      .select("id")
      .eq("status", "queued")
      .order("priority", { ascending: false })
      .limit(3);

    for (const task of queued ?? []) {
      const result = await dispatchAiTask(task.id);
      dispatched.push({ taskId: task.id, ok: result.ok });
    }
  }

  return NextResponse.json({
    ok: Object.values(tables).every(Boolean),
    phase: "v35.0-phase2",
    tables,
    counts,
    dispatched,
    generatedAt: new Date().toISOString(),
  });
}
