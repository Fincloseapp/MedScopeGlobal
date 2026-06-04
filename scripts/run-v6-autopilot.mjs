/**
 * Run one V6 autopilot job locally.
 * Usage: node scripts/run-v6-autopilot.mjs hourly_pubmed_monitor
 */
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs from "fs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const job = process.argv[2] ?? "hourly_pubmed_monitor";
const { isAutopilotJobSlug, runAutopilotJob, AUTOPILOT_JOB_SLUGS } = await import(
  pathToFileURL(path.join(root, "lib/v6/run-job.ts")).href
);

if (!isAutopilotJobSlug(job)) {
  console.error("Job must be one of:", AUTOPILOT_JOB_SLUGS.join(", "));
  process.exit(1);
}

console.log("Running", job, "…");
const result = await runAutopilotJob(job);
console.log(JSON.stringify(result, null, 2));
process.exit(0);
