/**
 * Run V4d medical AI fetch locally.
 * Usage: npx tsx scripts/run-medical-ai-cron.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const { runMedicalAiFetch } = await import(
  pathToFileURL(path.join(root, "lib/v4d/medical-ai-fetch.ts")).href
);

console.log("→ medical-ai-fetch …");
const result = await runMedicalAiFetch();
console.log(JSON.stringify(result, null, 2));
