/**
 * V17 ACP module verification for production deploy.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { runEnvPreflight } from "./verify-env.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const envPreflight = runEnvPreflight({ root });
if (!envPreflight.ok) {
  for (const msg of envPreflight.errors) console.error("✗", msg);
  process.exit(1);
}
console.log("✓ env preflight (CRON_SECRET)");

const required = [
  "lib/v17/acp/orchestrator.ts",
  "lib/v17/acp/validator.ts",
  "lib/v17/acp/aggregator.ts",
  "lib/v17/acp/summarizer.ts",
  "lib/v17/acp/compliance.ts",
  "lib/v17/acp/audit.ts",
  "lib/v17/acp/types.ts",
  "edge/v17/acp-edge.ts",
  "jobs/v17/acpJob.ts",
  "app/api/v17/acp/route.ts",
];

let ok = true;

for (const rel of required) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) {
    console.error("✗ Missing", rel);
    ok = false;
  } else {
    console.log("✓", rel);
  }
}

const orchestrator = fs.readFileSync(path.join(root, "lib/v17/acp/orchestrator.ts"), "utf8");
if (!orchestrator.includes("runAcpPipeline")) {
  console.error("✗ orchestrator must export runAcpPipeline");
  ok = false;
} else {
  console.log("✓ runAcpPipeline present");
}

process.exit(ok ? 0 : 1);
