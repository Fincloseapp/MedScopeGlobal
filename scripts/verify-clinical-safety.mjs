/**
 * V17 clinical safety guardrails verification.
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
const guardrailsPath = path.join(root, "lib/v17/security/clinical-guardrails.ts");

let ok = true;

if (!fs.existsSync(guardrailsPath)) {
  console.error("✗ Missing clinical-guardrails.ts");
  process.exit(1);
}

const src = fs.readFileSync(guardrailsPath, "utf8");
const requiredExports = ["validateClinicalSafety"];

for (const name of requiredExports) {
  if (!src.includes(`export function ${name}`)) {
    console.error(`✗ Missing export: ${name}`);
    ok = false;
  } else {
    console.log("✓", name);
  }
}

const rules = [
  "Treatment recommendations present without supporting diagnosis",
  "Clinical conclusion present without supporting evidence",
  "Treatment recommendations present without risk scoring profile",
];

for (const rule of rules) {
  if (!src.includes(rule)) {
    console.error("✗ Missing guardrail rule:", rule);
    ok = false;
  } else {
    console.log("✓ rule:", rule.slice(0, 48));
  }
}

process.exit(ok ? 0 : 1);
