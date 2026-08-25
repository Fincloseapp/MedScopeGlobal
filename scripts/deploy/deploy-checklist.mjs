#!/usr/bin/env node
/**
 * Pre-deploy checklist for medscopeglobal.com (Cloudflare Workers).
 * Runs typecheck, test, and db:verify (read-only Supabase guidance).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

function run(label, cmd, args) {
  console.log(`\n=== ${label} ===\n`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) {
    console.error(`\n✗ ${label} failed (exit ${r.status ?? 1})`);
    process.exit(r.status || 1);
  }
  console.log(`\n✓ ${label} passed`);
}

console.log("MedScopeGlobal production deploy checklist");
console.log("Target: https://medscopeglobal.com (Cloudflare Workers)\n");

run("typecheck", "pnpm", ["typecheck"]);
run("test", "pnpm", ["test"]);

const envLocal = path.join(root, ".env.local");
console.log("\n=== db:verify (Supabase dry check) ===\n");

if (!existsSync(envLocal)) {
  console.log("○ .env.local missing — skipping live Supabase verification.");
  console.log("\nGuidance:");
  console.log("  1. Copy keys from D:\\medscope.local\\.env.local (or Supabase dashboard)");
  console.log("  2. Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,");
  console.log("     SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET");
  console.log("  3. Run: pnpm db:verify");
  console.log("  4. Apply ecosystem migrations (see docs/deploy/production-runbook.md §1)");
  console.log("\n✓ Static checks passed; complete db:verify locally before production deploy.");
  process.exit(0);
}

// Skip live verify when placeholder Supabase (cloud dev pod) — avoids slow fetch timeouts
const envText = readFileSync(envLocal, "utf8");
const supabaseUrl = envText.match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m)?.[1]?.trim() ?? "";
if (/placeholder/i.test(supabaseUrl)) {
  console.log("○ Placeholder Supabase URL — skipping live db:verify.");
  console.log("\nGuidance before production deploy:");
  console.log("  1. Use real keys from D:\\medscope.local\\.env.local");
  console.log("  2. pnpm db:migrate  (or apply 3 ecosystem SQL files in Supabase dashboard)");
  console.log("  3. pnpm db:verify");
  console.log("  4. pnpm cf:env:sync → CLOUDFLARE_ENV_JSON / Worker secrets");
  console.log("\n✓ Static checks passed; run db:verify on Windows D: before merge to main.");
  process.exit(0);
}

run("db:verify", "pnpm", ["db:verify"]);

console.log("\n✅ deploy:checklist complete — safe to merge/deploy per docs/deploy/production-runbook.md");
