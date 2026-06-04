/**
 * Ensures V6 API route files exist and match canonical config before deploy.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Must match lib/v6/v6-api-handlers.ts V6_ROUTE_CONFIG */
const V6_ROUTE_CONFIG = {
  pubmed: {
    job: "pubmed",
    edgeFunction: "pubmed-monitor",
    autopilotJob: "hourly_pubmed_monitor",
  },
  regulatory: {
    job: "regulatory",
    edgeFunction: "regulatory-monitor",
    autopilotJob: "daily_regulatory_monitor",
  },
  autopublish: {
    job: "autopublish",
    edgeFunction: "autopublish",
    autopilotJob: "daily_autopublish",
  },
  trends: {
    job: "trends",
    edgeFunction: "trend-analysis",
    autopilotJob: "weekly_trend_analysis",
  },
  guidelines: {
    job: "guidelines",
    edgeFunction: "guideline-update",
    autopilotJob: "monthly_guideline_update",
  },
};

const edgeFunctions = new Set();
let ok = true;

for (const slug of Object.keys(V6_ROUTE_CONFIG)) {
  const { job, edgeFunction, autopilotJob } = V6_ROUTE_CONFIG[slug];
  if (edgeFunctions.has(edgeFunction)) {
    console.error("Duplicate edgeFunction:", edgeFunction);
    ok = false;
  }
  edgeFunctions.add(edgeFunction);

  const p = path.join(root, "app", "api", "v6", slug, "route.ts");
  if (!fs.existsSync(p)) {
    console.error("Missing:", p);
    ok = false;
    continue;
  }
  const src = fs.readFileSync(p, "utf8");
  if (!src.includes("export const { GET, PUT, POST }")) {
    console.error("Expected GET/PUT/POST re-export:", p);
    ok = false;
  }
  if (!src.includes(`createV6RouteHandlers("${slug}")`)) {
    console.error(`Expected createV6RouteHandlers("${slug}") in`, p);
    ok = false;
  }

  const handlers = path.join(root, "lib", "v6", "v6-api-handlers.ts");
  const handlersSrc = fs.readFileSync(handlers, "utf8");
  if (!handlersSrc.includes(`edgeFunction: "${edgeFunction}"`)) {
    console.error(`Missing edgeFunction "${edgeFunction}" in v6-api-handlers.ts`);
    ok = false;
  }
  if (!handlersSrc.includes(`autopilotJob: "${autopilotJob}"`)) {
    console.error(`Missing autopilotJob "${autopilotJob}" in v6-api-handlers.ts`);
    ok = false;
  }
  console.log(
    "OK",
    path.relative(root, p),
    `→ job=${job}, edge=${edgeFunction}, autopilot=${autopilotJob}`
  );
}

process.exit(ok ? 0 : 1);
