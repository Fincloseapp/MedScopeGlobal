import fs from "fs";
import path from "path";

function loadEnvLocal() {
  const root = path.join(__dirname, "..");
  const file = path.join(root, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim();
    }
  }
}

loadEnvLocal();

async function run() {
  const { runIngestionPipeline } = await import("../lib/ingestion/pipeline");
  const result = await runIngestionPipeline({
    triggeredBy: "cli",
    maxArticles: Number(process.env.INGEST_MAX_ARTICLES ?? 80),
  });
  console.log("Ingestion complete:", JSON.stringify(result, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
