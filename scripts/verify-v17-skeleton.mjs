/**
 * V17 skeleton validator — one canonical file per route, job, edge, and lib module.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const routes = ["reason", "summarize", "clinical", "graph", "guideline"];
const jobs = [
  "reasoningJob.ts",
  "summarizationJob.ts",
  "clinicalJob.ts",
  "graphBuildJob.ts",
  "guidelineJob.ts",
];
const edges = [
  "reasoning-edge.ts",
  "summarization-edge.ts",
  "clinical-edge.ts",
  "graph-edge.ts",
  "guideline-edge.ts",
];
const libModules = [
  "lib/v17/reasoning/extractor.ts",
  "lib/v17/reasoning/evaluator.ts",
  "lib/v17/reasoning/comparator.ts",
  "lib/v17/reasoning/inference.ts",
  "lib/v17/summarization/abstractive.ts",
  "lib/v17/summarization/extractive.ts",
  "lib/v17/summarization/hybrid.ts",
  "lib/v17/graph/builder.ts",
  "lib/v17/graph/linker.ts",
  "lib/v17/graph/normalizer.ts",
  "lib/v17/clinical/diagnosis.ts",
  "lib/v17/clinical/treatment.ts",
  "lib/v17/clinical/risk.ts",
  "lib/v17/clinical/evidence.ts",
  "lib/v17/v17-api-handlers.ts",
];

const forbiddenApiFiles = ["job.ts", "edge.ts", "handler.ts"];

let ok = true;

function fail(msg) {
  console.error("✗", msg);
  ok = false;
}

function pass(msg) {
  console.log("✓", msg);
}

function assertExactDir(dir, expectedFiles) {
  if (!fs.existsSync(dir)) {
    fail(`Missing directory: ${path.relative(root, dir)}`);
    return;
  }
  const actual = fs.readdirSync(dir).filter((f) => !f.startsWith("."));
  const extra = actual.filter((f) => !expectedFiles.includes(f));
  const missing = expectedFiles.filter((f) => !actual.includes(f));
  for (const f of missing) fail(`Missing ${path.relative(root, path.join(dir, f))}`);
  for (const f of extra) fail(`Duplicate/extra file ${path.relative(root, path.join(dir, f))}`);
  if (!missing.length && !extra.length) {
    pass(`${path.relative(root, dir)}/ → ${expectedFiles.length} files (no duplicates)`);
  }
}

for (const slug of routes) {
  const dir = path.join(root, "app", "api", "v17", slug);
  assertExactDir(dir, ["route.ts"]);
  for (const forbidden of forbiddenApiFiles) {
    const p = path.join(dir, forbidden);
    if (fs.existsSync(p)) fail(`Forbidden duplicate API file: ${path.relative(root, p)}`);
  }
}

assertExactDir(path.join(root, "jobs", "v17"), jobs);
assertExactDir(path.join(root, "edge", "v17"), edges);

for (const rel of libModules) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) fail(`Missing ${rel}`);
  else pass(rel);
}

// No second job/edge file with same basename elsewhere under v17 API tree
const apiV17 = path.join(root, "app", "api", "v17");
for (const slug of routes) {
  const src = fs.readFileSync(path.join(apiV17, slug, "route.ts"), "utf8");
  if (!src.includes(`createV17RouteHandlers("${slug}")`)) {
    fail(`Route ${slug} must only use createV17RouteHandlers("${slug}")`);
  } else {
    pass(`app/api/v17/${slug}/route.ts → single handler binding`);
  }
}

process.exit(ok ? 0 : 1);
