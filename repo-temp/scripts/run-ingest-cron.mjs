/**
 * Run article ingestion cron (same as GET /api/cron/ingest).
 * Usage: node scripts/run-ingest-cron.mjs
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

loadEnv();

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

console.log("→ cron/ingest (article pipeline) …");

const { runIngestionPipeline } = await import(
  pathToFileURL(path.join(root, "lib/ingestion/pipeline.ts")).href
);

const result = await runIngestionPipeline({
  triggeredBy: "manual-cron",
  maxArticles: 24,
});

console.log("OK", JSON.stringify(result, null, 2));
