import { ECOSYSTEM_MIGRATION_SQL } from "@/lib/ecosystem/embedded-migrations";
import { runManagementQuery } from "@/lib/supabase/management-api";

export type MigrationApplyResult = {
  name: string;
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

export type ApplyEcosystemMigrationsOutcome = {
  ok: boolean;
  projectRef: string | null;
  results: MigrationApplyResult[];
  timestamp: string;
};

/** Apply the three 20260825* ecosystem migrations via Supabase Management API. */
export async function applyEcosystemMigrations(): Promise<ApplyEcosystemMigrationsOutcome> {
  const projectRef =
    process.env.SUPABASE_PROJECT_REF ??
    process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1] ??
    null;

  if (!process.env.SUPABASE_ACCESS_TOKEN) {
    return {
      ok: false,
      projectRef,
      results: ECOSYSTEM_MIGRATION_SQL.map((m) => ({
        name: m.name,
        ok: false,
        error: "SUPABASE_ACCESS_TOKEN not configured",
      })),
      timestamp: new Date().toISOString(),
    };
  }

  const results: MigrationApplyResult[] = [];

  for (const migration of ECOSYSTEM_MIGRATION_SQL) {
    const outcome = await runManagementQuery(migration.sql);
    if (outcome.ok) {
      results.push({ name: migration.name, ok: true });
      continue;
    }

    const msg = outcome.message;
    // Idempotent re-runs — treat "already exists" as success
    if (/already exists|duplicate key|relation .* already exists/i.test(msg)) {
      results.push({ name: migration.name, ok: true, skipped: true });
      continue;
    }

    results.push({ name: migration.name, ok: false, error: msg });
    return {
      ok: false,
      projectRef,
      results,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    ok: true,
    projectRef,
    results,
    timestamp: new Date().toISOString(),
  };
}
