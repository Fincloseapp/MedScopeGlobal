/**
 * V17 skeleton validator — one canonical file per route, job, edge, and lib module.
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

const routes = ["reason", "summarize", "clinical", "graph", "guideline", "acp", "deploy", "health", "monitoring", "rollback"];
const jobs = [
  "reasoningJob.ts",
  "summarizationJob.ts",
  "clinicalJob.ts",
  "graphBuildJob.ts",
  "guidelineJob.ts",
  "acpJob.ts",
];
const edges = [
  "reasoning-edge.ts",
  "summarization-edge.ts",
  "clinical-edge.ts",
  "graph-edge.ts",
  "guideline-edge.ts",
  "acp-edge.ts",
  "pre-deploy-check.ts",
];
const libModules = [
  "lib/v17/reasoning/extractor.ts",
  "lib/v17/reasoning/evaluator.ts",
  "lib/v17/reasoning/comparator.ts",
  "lib/v17/reasoning/inference.ts",
  "lib/v17/reasoning/types.ts",
  "lib/v17/summarization/abstractive.ts",
  "lib/v17/summarization/extractive.ts",
  "lib/v17/summarization/hybrid.ts",
  "lib/v17/graph/builder.ts",
  "lib/v17/graph/linker.ts",
  "lib/v17/graph/normalizer.ts",
  "lib/v17/graph/types.ts",
  "lib/v17/graph/linking/text-match.ts",
  "lib/v17/graph/linking/edge-metadata.ts",
  "lib/v17/graph/linking/edge-scoring.ts",
  "lib/v17/clinical/types.ts",
  "lib/v17/clinical/graph-context.ts",
  "lib/v17/clinical/diagnosis.ts",
  "lib/v17/clinical/treatment.ts",
  "lib/v17/clinical/risk.ts",
  "lib/v17/clinical/evidence.ts",
  "lib/v17/acp/types.ts",
  "lib/v17/acp/validator.ts",
  "lib/v17/acp/aggregator.ts",
  "lib/v17/acp/summarizer.ts",
  "lib/v17/acp/compliance.ts",
  "lib/v17/acp/audit.ts",
  "lib/v17/acp/orchestrator.ts",
  "lib/v17/security/sanitize.ts",
  "lib/v17/security/clinical-guardrails.ts",
  "lib/v17/security/rate-limit.ts",
  "lib/v17/audit/logger.ts",
  "lib/v17/fallback/fallback.ts",
  "lib/v17/monitoring/hooks.ts",
  "lib/v17/versioning/version.ts",
  "lib/v17/production/run-production-acp.ts",
  "lib/v17/output/formatter.ts",
  "lib/v17/health/healthcheck.ts",
  "lib/v17/production/run-production-job.ts",
  "lib/v17/production/create-v17-production-route.ts",
  "lib/v17/guideline/parser.ts",
  "lib/v17/monitoring/dashboard.ts",
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
  const usesHandler = src.includes(`createV17RouteHandlers("${slug}")`);
  const usesProductionJob =
    ["reason", "clinical", "graph", "summarize", "guideline"].includes(slug) &&
    src.includes("createV17ProductionRoute");
  const usesReasonPipeline =
    slug === "reason" && src.includes("reasoningJob") && src.includes('job: JOB');
  const usesGraphPipeline =
    slug === "graph" && src.includes("graphBuildJob") && src.includes('job: JOB');
  const usesClinicalPipeline =
    slug === "clinical" && src.includes("clinicalJob") && src.includes('job: JOB');
  const usesAcpPipeline =
    slug === "acp" && src.includes("runProductionAcp") && src.includes('job: JOB');
  const usesDeployPipeline =
    slug === "deploy" && src.includes("preDeployCheck");
  const usesHealthPipeline =
    slug === "health" && src.includes("runHealthcheck");
  const usesMonitoringPipeline =
    slug === "monitoring" && src.includes("getMonitoringSnapshot");
  const usesDeployPostPipeline =
    slug === "deploy" &&
    (src.includes("vercel_production") || src.includes("auto_deploy") || src.includes("AUTO_DEPLOY"));
  const usesRollbackPipeline =
    slug === "rollback" && (src.includes("vercel_rollback") || src.includes("use_vercel_dashboard"));
  if (
    !usesHandler &&
    !usesProductionJob &&
    !usesReasonPipeline &&
    !usesGraphPipeline &&
    !usesClinicalPipeline &&
    !usesAcpPipeline &&
    !usesDeployPipeline &&
    !usesDeployPostPipeline &&
    !usesHealthPipeline &&
    !usesMonitoringPipeline &&
    !usesRollbackPipeline
  ) {
    fail(`Route ${slug} must use createV17RouteHandlers or dedicated pipeline binding`);
  } else {
    pass(`app/api/v17/${slug}/route.ts → valid handler binding`);
  }
}

process.exit(ok ? 0 : 1);
