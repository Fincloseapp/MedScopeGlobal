import { readFileSync } from "node:fs";
import path from "node:path";
import { runManagementQuery } from "@/lib/supabase/management-api";

export function loadExchangeMigrationSql(): string {
  const file = path.join(process.cwd(), "supabase/migrations/20260910120000_b2b_exchange.sql");
  return readFileSync(file, "utf8");
}

export async function applyExchangeSchema(): Promise<{ ok: boolean; error?: string }> {
  try {
    const result = await runManagementQuery(loadExchangeMigrationSql());
    if (!result.ok) return { ok: false, error: result.message };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "exchange schema failed" };
  }
}
