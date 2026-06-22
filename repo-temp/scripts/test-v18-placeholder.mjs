/**
 * Placeholder tests for AI Engine v18 (CI).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

assert.ok(existsSync(join(root, "lib/ai/models.ts")), "lib/ai/models.ts missing");
assert.ok(existsSync(join(root, "lib/ai/engine.ts")), "lib/ai/engine.ts missing");
assert.match(read("lib/ai/models.ts"), /AI_MODELS/, "AI_MODELS export expected");
assert.match(read("lib/ai/models.ts"), /llama3-70b-8192/, "primary model expected");

const routes = [
  "app/api/v18/upload/route.ts",
  "app/api/v18/summarize/route.ts",
  "app/api/v18/guideline/route.ts",
  "app/api/v18/clinical-check/route.ts",
  "app/api/v18/health/route.ts",
  "app/api/v18/monitoring/route.ts",
];
for (const route of routes) {
  assert.ok(existsSync(join(root, route)), `missing route ${route}`);
}

assert.match(read("lib/ai/safety.ts"), /applySafetyLayer/, "safety layer expected");
assert.match(read("lib/doc/extract.ts"), /MAX_DOCUMENT_BYTES/, "document limit expected");

console.log("✓ v18 placeholder tests passed");
