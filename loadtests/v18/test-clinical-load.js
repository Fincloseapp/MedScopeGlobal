#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_URL, PAYLOADS, THRESHOLDS } from "./lib/config.mjs";
import { runRpsLoad, postJson } from "./lib/rps-runner.mjs";

const outDir = dirname(fileURLToPath(import.meta.url));

const result = await runRpsLoad({
  name: "clinical-check",
  requestFn: ({ signal }) =>
    postJson(BASE_URL, "/api/v18/clinical-check", PAYLOADS["clinical-check"], {
      signal,
    }),
});

result.threshold = THRESHOLDS["clinical-check"];
result.passed =
  result.errorRatePct === 0 &&
  result.stats.p95Ms <= THRESHOLDS["clinical-check"].p95Ms;

writeFileSync(join(outDir, "results-clinical-check.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify({ test: "clinical-check", ...result.stats, errorRatePct: result.errorRatePct, passed: result.passed }));
process.exit(result.passed ? 0 : 1);
