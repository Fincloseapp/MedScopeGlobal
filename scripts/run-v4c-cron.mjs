/**
 * Run V4c cron jobs locally (direct import, no HTTP server required).
 * Usage: node scripts/run-v4c-cron.mjs [daily|newsletter|all]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env.local");
    process.exit(1);
  }
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

async function importTs(rel) {
  const full = path.join(root, rel);
  return import(pathToFileURL(full).href);
}

const mode = process.argv[2] ?? "all";

loadEnv();

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

async function main() {
  if (mode === "daily" || mode === "all") {
    console.log("→ v4c-daily ingest …");
    const { runV4cDailyIngest } = await importTs("lib/v4c/daily-ingest.ts");
    const result = await runV4cDailyIngest();
    console.log("OK", JSON.stringify(result, null, 2));
  }

  if (mode === "newsletter" || mode === "all") {
    console.log("→ newsletter-generate …");
    const { generateNewsletterIssue } = await importTs("lib/v4c/newsletter-generate.ts");
    const result = await generateNewsletterIssue();
    console.log("OK", JSON.stringify(result, null, 2));
  }
}

main().catch((e) => {
  console.error("FAILED", e.message);
  process.exit(1);
});
