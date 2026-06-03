/**
 * One-shot production prep: seed categories, ingest articles, verify counts.
 */
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: root, stdio: "inherit", shell: true });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exit ${code}`))));
  });
}

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

console.log("=== MedScopeGlobal production bootstrap ===\n");

const { error: trErr } = await admin
  .from("article_translations")
  .select("article_id, locale")
  .limit(1);
if (trErr) {
  console.log("⚠️  Table article_translations missing.");
  console.log("   Supabase → SQL Editor → run: supabase/migrations/20240525000004_article_translations.sql\n");
} else {
  console.log("✓ article_translations table\n");
}

console.log("1/2 Seeding categories...");
await run("node", ["scripts/seed-categories.mjs"]);

console.log("\n2/2 Running ingestion (up to 80 articles)...");
await run("npx", ["tsx", path.join(root, "scripts", "run-ingestion.ts")]);

const { count: cat } = await admin
  .from("categories")
  .select("id", { count: "exact", head: true });
const { count: art } = await admin
  .from("articles")
  .select("id", { count: "exact", head: true })
  .eq("published", true);
const { count: cs } = await admin
  .from("articles")
  .select("id", { count: "exact", head: true })
  .eq("published", true)
  .eq("locale", "cs");

console.log(`\n✓ Categories: ${cat ?? 0}`);
console.log(`✓ Published articles: ${art ?? 0} (cs: ${cs ?? 0})`);
console.log(`
Next for https://medscopeglobal.com:
  1. Vercel env: NEXT_PUBLIC_SITE_URL=https://medscopeglobal.com
  2. Supabase Auth redirect: https://medscopeglobal.com/auth/callback
  3. Vercel cron uses CRON_SECRET (already in vercel.json every 6h)
  4. Deploy: vercel --prod  (or push to connected Git repo)
`);
