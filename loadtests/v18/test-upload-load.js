#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE_URL, THRESHOLDS } from "./lib/config.mjs";
import { generatePdf200Kb } from "./lib/generate-pdf-200kb.mjs";
import { runRpsLoad, postUpload } from "./lib/rps-runner.mjs";

const outDir = dirname(fileURLToPath(import.meta.url));
const pdfBuffer = generatePdf200Kb(200 * 1024);

const result = await runRpsLoad({
  name: "upload",
  timeoutMs: 30_000,
  maxInflight: 80,
  requestFn: ({ signal }) =>
    postUpload(BASE_URL, pdfBuffer, "load-200kb.pdf", { signal }),
});

result.threshold = THRESHOLDS.upload;
result.pdfBytes = pdfBuffer.length;
result.passed =
  result.errorRatePct < 5 &&
  result.stats.p95Ms <= THRESHOLDS.upload.p95Ms;

writeFileSync(join(outDir, "results-upload.json"), JSON.stringify(result, null, 2));
console.log(
  JSON.stringify({
    test: "upload",
    pdfBytes: pdfBuffer.length,
    ...result.stats,
    errorRatePct: result.errorRatePct,
    passed: result.passed,
  })
);
process.exit(result.passed ? 0 : 1);
