/**
 * v19 daily cron — generate briefs for cs + en, drain async queue.
 */
import { runV19GenerateBatch, processV19Job } from "@/lib/v19/engine";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function runV19DailyBriefs(): Promise<{
  cs: { generated: number };
  en: { generated: number };
  queueProcessed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let csGenerated = 0;
  let enGenerated = 0;

  try {
    const cs = await runV19GenerateBatch({ count: 7, locale: "cs" });
    csGenerated = cs.generated;
  } catch (e) {
    errors.push(`cs: ${(e as Error).message}`);
  }

  try {
    const en = await runV19GenerateBatch({ count: 7, locale: "en" });
    enGenerated = en.generated;
  } catch (e) {
    errors.push(`en: ${(e as Error).message}`);
  }

  let queueProcessed = 0;
  try {
    const admin = createServiceRoleClient();
    const { data: pending } = await admin
      .from("v19_content_jobs")
      .select("id")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(5);

    for (const job of pending ?? []) {
      await processV19Job(job.id as string);
      queueProcessed += 1;
    }
  } catch (e) {
    errors.push(`queue: ${(e as Error).message}`);
  }

  return {
    cs: { generated: csGenerated },
    en: { generated: enGenerated },
    queueProcessed,
    errors,
  };
}
