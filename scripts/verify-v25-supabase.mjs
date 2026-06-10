#!/usr/bin/env node
/**
 * Verify v25 Supabase tables + snapshot read/write.
 */
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { loadProjectEnv } from "./load-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = loadProjectEnv(root);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const V25_TABLES = [
  "v25_system_runs",
  "v25_fix_log",
  "v25_university_runs",
  "v25_system_snapshot",
  "v25_universities_snapshot",
];

async function main() {
  let ok = true;
  console.log("=== v25 Supabase tables ===\n");

  for (const table of V25_TABLES) {
    const { error } = await supabase.from(table).select("*").limit(1);
    const pass = !error;
    console.log(`${pass ? "✓" : "✗"} ${table}${error ? ` — ${error.message}` : ""}`);
    if (!pass) ok = false;
  }

  const probe = {
    id: "production",
    state: {
      version: "v25.1",
      tests: { linkTest: "ok", probe: true },
      probeAt: new Date().toISOString(),
    },
    updated_at: new Date().toISOString(),
  };

  const { error: upsertErr } = await supabase.from("v25_system_snapshot").upsert(probe);
  if (upsertErr) {
    console.log(`\n✗ snapshot upsert — ${upsertErr.message}`);
    ok = false;
  } else {
    const { data, error: readErr } = await supabase
      .from("v25_system_snapshot")
      .select("state")
      .eq("id", "production")
      .maybeSingle();
    if (readErr || !data?.state?.tests?.probe) {
      console.log(`\n✗ snapshot read — ${readErr?.message ?? "missing probe flag"}`);
      ok = false;
    } else {
      console.log("\n✓ v25_system_snapshot read/write OK");
    }
  }

  console.log(ok ? "\nPASS — v25 Supabase ready" : "\nFAIL — run: npm run db:setup");
  process.exit(ok ? 0 : 1);
}

await main();
