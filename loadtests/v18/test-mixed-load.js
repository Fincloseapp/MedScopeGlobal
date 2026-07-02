#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_URL, PAYLOADS, THRESHOLDS } from "./lib/config.mjs";
import { generatePdf200Kb } from "./lib/generate-pdf-200kb.mjs";
import { runRpsLoad, postJson, postUpload } from "./lib/rps-runner.mjs";

const outDir = dirname(fileURLToPath(import.meta.url));
const pdfBuffer = generatePdf200Kb(200 * 1024);

const endpoints = [
  {
    key: "summarize",
    fn: (signal) => postJson(BASE_URL, "/api/v18/summarize", PAYLOADS.summarize, { signal }),
  },
  {
    key: "guideline",
    fn: (signal) => postJson(BASE_URL, "/api/v18/guideline", PAYLOADS.guideline, { signal }),
  },
  {
    key: "clinical-check",
    fn: (signal) =>
      postJson(BASE_URL, "/api/v18/clinical-check", PAYLOADS["clinical-check"], { signal }),
  },
  {
    key: "upload",
    fn: (signal) => postUpload(BASE_URL, pdfBuffer, "mixed-200kb.pdf", { signal }),
  },
];

const result = await runRpsLoad({
  name: "mixed",
  requestFn: ({ signal }) => {
    const pick = endpoints[Math.floor(Math.random() * endpoints.length)];
    return pick.fn(signal);
  },
});

result.threshold = THRESHOLDS.mixed;
result.passed = result.errorRatePct < THRESHOLDS.mixed.errorRatePct;

writeFileSync(join(outDir, "results-mixed.json"), JSON.stringify(result, null, 2));
console.log(
  JSON.stringify({
    test: "mixed",
    ...result.stats,
    errorRatePct: result.errorRatePct,
    fallbackActivationRatePct: result.fallbackActivationRatePct,
    passed: result.passed,
  })
);
process.exit(result.passed ? 0 : 1);
