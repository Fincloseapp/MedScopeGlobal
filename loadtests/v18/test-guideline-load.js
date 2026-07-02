#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_URL, PAYLOADS, THRESHOLDS } from "./lib/config.mjs";
import { runRpsLoad, postJson } from "./lib/rps-runner.mjs";

const outDir = dirname(fileURLToPath(import.meta.url));

const result = await runRpsLoad({
  name: "guideline",
  requestFn: ({ signal }) =>
    postJson(BASE_URL, "/api/v18/guideline", PAYLOADS.guideline, { signal }),
});

result.threshold = THRESHOLDS.guideline;
result.passed =
  result.errorRatePct === 0 &&
  result.stats.p95Ms <= THRESHOLDS.guideline.p95Ms;

writeFileSync(join(outDir, "results-guideline.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ test: "guideline", ...result.stats, errorRatePct: result.errorRatePct, passed: result.passed }));
process.exit(result.passed ? 0 : 1);
