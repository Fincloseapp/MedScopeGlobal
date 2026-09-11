import { EXCHANGE_MIGRATION_SQL } from "@/lib/exchange/embedded-migrations";
import { runManagementQuery, supabaseProjectRef } from "@/lib/supabase/management-api";

export type ExchangeMigrationApplyResult = {
  name: string;
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

export type ApplyExchangeSchemaOutcome = {
  ok: boolean;
  projectRef: string | null;
  results: ExchangeMigrationApplyResult[];
  timestamp: string;
};

function alreadyApplied(message: string): boolean {
  return /already exists|duplicate key|duplicate_object|relation .* already exists|column .* already exists/i.test(
    message
  );
}

/** Apply both B2B Exchange SQL files via Supabase Management API (Workers-safe). */
export async function applyExchangeSchema(): Promise<ApplyExchangeSchemaOutcome> {
  const projectRef = supabaseProjectRef();
  const timestamp = new Date().toISOString();

  if (!process.env.SUPABASE_ACCESS_TOKEN) {
    return {
      ok: false,
      projectRef,
      results: EXCHANGE_MIGRATION_SQL.map((m) => ({
        name: m.name,
        ok: false,
        error: "SUPABASE_ACCESS_TOKEN not configured",
      })),
      timestamp,
    };
  }

  const results: ExchangeMigrationApplyResult[] = [];

  for (const migration of EXCHANGE_MIGRATION_SQL) {
    const outcome = await runManagementQuery(migration.sql);
    if (outcome.ok) {
      results.push({ name: migration.name, ok: true });
      continue;
    }

    if (alreadyApplied(outcome.message)) {
      results.push({ name: migration.name, ok: true, skipped: true });
      continue;
    }

    results.push({ name: migration.name, ok: false, error: outcome.message });
    return { ok: false, projectRef, results, timestamp: new Date().toISOString() };
  }

  return { ok: true, projectRef, results, timestamp: new Date().toISOString() };
}
