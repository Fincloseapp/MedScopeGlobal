/**
 * Ensures V17 skeleton files exist before deploy.
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

let ok = true;

for (const slug of routes) {
  const p = path.join(root, "app", "api", "v17", slug, "route.ts");
  if (!fs.existsSync(p)) {
    console.error("Missing:", p);
    ok = false;
  } else {
    console.log("OK", path.relative(root, p));
  }
}

for (const file of jobs) {
  const p = path.join(root, "jobs", "v17", file);
  if (!fs.existsSync(p)) {
    console.error("Missing:", p);
    ok = false;
  } else {
    console.log("OK", path.relative(root, p));
  }
}

for (const file of edges) {
  const p = path.join(root, "edge", "v17", file);
  if (!fs.existsSync(p)) {
    console.error("Missing:", p);
    ok = false;
  } else {
    console.log("OK", path.relative(root, p));
  }
}

if (!fs.existsSync(path.join(root, "lib", "v17", "v17-api-handlers.ts"))) {
  console.error("Missing: lib/v17/v17-api-handlers.ts");
  ok = false;
}

process.exit(ok ? 0 : 1);
