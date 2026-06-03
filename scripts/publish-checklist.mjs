/**
 * Pre-flight checklist for medscopeglobal.com (no secrets printed).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const checks = [];
const aiKeyValid = Boolean(env.OPENAI_API_KEY?.startsWith("sk-") || env.OPEN_API_KEY?.startsWith("sk-"));

checks.push(["NEXT_PUBLIC_SITE_URL", env.NEXT_PUBLIC_SITE_URL?.includes("medscopeglobal.com")]);
checks.push(["CRON_SECRET", Boolean(env.CRON_SECRET?.length > 20)]);
checks.push(["OPENAI_API_KEY / OPEN_API_KEY", aiKeyValid]);
checks.push(["INGESTION_LOCALE", env.INGESTION_LOCALE || "cs"]);

const { count: articles } = await admin
  .from("articles")
  .select("id", { count: "exact", head: true })
  .eq("published", true);

const { error: tr } = await admin
  .from("article_translations")
  .select("article_id, locale")
  .limit(1);

let siteStatus = "unknown";
try {
  const r = await fetch("https://medscopeglobal.com", { signal: AbortSignal.timeout(15000) });
  siteStatus = String(r.status);
} catch (e) {
  siteStatus = e instanceof Error ? e.message : String(e);
}

console.log("=== Publish checklist ===\n");
for (const [k, ok] of checks) {
  console.log(`${ok ? "✓" : "○"} ${k}`);
}
console.log(`\nPublished articles in DB: ${articles ?? 0}`);
console.log(`article_translations table: ${tr ? "MISSING (run SQL migration)" : "OK"}`);
console.log(`https://medscopeglobal.com → HTTP ${siteStatus}`);

if (siteStatus === "503" || siteStatus.startsWith("5")) {
  console.log("\n→ Deploy app on Vercel and connect domain (see docs/PRODUCTION-MEDSCOPEGLOBAL.md)");
}
