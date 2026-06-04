/**
 * Ensures V6 API route files exist and match canonical config before deploy.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Must match lib/v6/v6-api-handlers.ts V6_ROUTE_CONFIG */
const V6_ROUTE_CONFIG = {
  pubmed: { job: "pubmed", edgeFunction: "pubmed-monitor" },
  regulatory: { job: "regulatory", edgeFunction: "regulatory-monitor" },
  autopublish: { job: "autopublish", edgeFunction: "autopublish" },
  trends: { job: "trends", edgeFunction: "trend-analysis" },
  guidelines: { job: "guidelines", edgeFunction: "guideline-update" },
};

let ok = true;

for (const slug of Object.keys(V6_ROUTE_CONFIG)) {
  const { job, edgeFunction } = V6_ROUTE_CONFIG[slug];
  const p = path.join(root, "app", "api", "v6", slug, "route.ts");
  if (!fs.existsSync(p)) {
    console.error("Missing:", p);
    ok = false;
    continue;
  }
  const src = fs.readFileSync(p, "utf8");
  if (!src.includes("export const { GET, POST }")) {
    console.error("Expected re-export of GET/POST:", p);
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
  console.log("OK", path.relative(root, p), `→ job=${job}, edge=${edgeFunction}`);
}

process.exit(ok ? 0 : 1);
