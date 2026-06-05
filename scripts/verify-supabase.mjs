import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { loadProjectEnv } from "./load-env.mjs";
import { validateCronSecret } from "./verify-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = loadProjectEnv(root);

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CRON_SECRET",
];

const s = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

/** Use .limit(1) — PostgREST head requests lie about missing tables. */
const requiredTables = [
  ["users", "id"],
  ["categories", "id"],
  ["articles", "id"],
  ["ads", "id"],
  ["vip_subscriptions", "id"],
];

const recommendedTables = [
  ["article_translations", "article_id"],
  ["rubrics", "slug"],
  ["ingestion_runs", "id"],
  ["ingestion_schedule", "id"],
  ["user_profiles", "user_id"],
  ["saved_articles", "id"],
  ["ad_impressions", "id"],
  ["ad_clicks", "id"],
  ["medical_ai_texts", "id"],
  ["medical_sources", "id"],
  ["medical_citations", "id"],
  ["medical_evidence", "id"],
  ["ai_medical_logs", "id"],
  ["autopilot_runs", "id"],
  ["autopilot_alerts", "id"],
  ["autopilot_trends", "id"],
  ["autopilot_settings", "id"],
  ["autopilot_cron_jobs", "slug"],
];

let ok = true;

console.log("=== .env.local ===\n");
for (const k of required) {
  const has =
    k === "CRON_SECRET" ? validateCronSecret(env).ok : Boolean(env[k]?.length);
  console.log(`${has ? "✓" : "✗"} ${k}`);
  if (!has) ok = false;
}
const groqConfigured = Boolean(
  env.GROQ_API_KEY?.startsWith("gsk_") && env.GROQ_API_KEY.length > 20
);
const aiKeyConfigured = Boolean(env.OPENAI_API_KEY || env.OPEN_API_KEY);
console.log(`${groqConfigured ? "✓" : "○"} GROQ_API_KEY (V5 primary AI)`);
console.log(`${aiKeyConfigured ? "✓" : "○"} OPENAI_API_KEY / OPEN_API_KEY (optional fallback)`);

console.log("\n=== Supabase tables (required) ===\n");
for (const [t, col] of requiredTables) {
  const { error } = await s.from(t).select(col).limit(1);
  console.log(`${error ? "✗" : "✓"} ${t}${error ? ` — ${error.message}` : ""}`);
  if (error) ok = false;
}

console.log("\n=== Platform / i18n (recommended) ===\n");
let missingRecommended = false;
for (const [t, col] of recommendedTables) {
  const { error } = await s.from(t).select(col).limit(1);
  console.log(`${error ? "○" : "✓"} ${t}${error ? " — run supabase/MISSING_PRODUCTION_TABLES.sql" : ""}`);
  if (error) missingRecommended = true;
}
if (missingRecommended) {
  console.log("\n→ Paste supabase/MISSING_PRODUCTION_TABLES.sql in Supabase SQL Editor");
}

const colChecks = [
  "excerpt",
  "summary",
  "cover_image_url",
  "vip_only",
  "source_url",
  "hash_dedup",
  "content_type",
  "med_track",
  "study_year",
  "is_premium",
];
const { data: art, error: artErr } = await s.from("articles").select("*").limit(1);
if (artErr) {
  console.log(`\n✗ articles: ${artErr.message}`);
  ok = false;
} else {
  const row = art?.[0] ?? {};
  for (const c of colChecks) {
    const has = c in row;
    console.log(`${has ? "✓" : "○"} articles.${c}${!has && c === "summary" ? " (required legacy)" : ""}`);
    if (!has && (c === "summary" || c === "content")) ok = false;
  }
  const appReady = ("excerpt" in row || "summary" in row) && "content" in row;
  console.log(appReady ? "\n✓ articles readable by app" : "\n✗ articles schema incomplete");
  if (!appReady) ok = false;
}

const { count } = await s
  .from("categories")
  .select("id", { count: "exact", head: true });
console.log(`\nCategories in DB: ${count ?? 0}`);

console.log(ok ? "\n✅ Ready — run: npm run dev" : "\n⚠️  Run: npm run db:setup");
process.exit(ok ? 0 : 1);
