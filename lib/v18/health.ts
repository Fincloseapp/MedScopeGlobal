import { existsSync } from "node:fs";
import { join } from "node:path";
import { isGroqConfigured } from "@/lib/ai/groq";

export const V18_VERSION = "V18.0.0";

const V18_ROUTES = [
  "app/api/v18/upload/route.ts",
  "app/api/v18/summarize/route.ts",
  "app/api/v18/guideline/route.ts",
  "app/api/v18/clinical-check/route.ts",
  "app/api/v18/health/route.ts",
  "app/api/v18/monitoring/route.ts",
];

export type V18HealthResult = {
  status: "healthy" | "degraded" | "unhealthy";
  engine: "v18";
  version: string;
  timestamp: string;
  checks: {
    routes: { ok: boolean; missing: string[] };
    groq: { ok: boolean };
    engine: { ok: boolean };
  };
};

export function runV18Healthcheck(root = process.cwd()): V18HealthResult {
  const missing = V18_ROUTES.filter((rel) => !existsSync(join(root, rel)));
  const routesOk = missing.length === 0;
  const groqOk = isGroqConfigured();
  const engineOk = existsSync(join(root, "lib/ai/engine.ts"));

  let status: V18HealthResult["status"] = "healthy";
  if (!routesOk || !engineOk) status = "unhealthy";
  else if (!groqOk) status = "degraded";

  return {
    status,
    engine: "v18",
    version: V18_VERSION,
    timestamp: new Date().toISOString(),
    checks: {
      routes: { ok: routesOk, missing },
      groq: { ok: groqOk },
      engine: { ok: engineOk },
    },
  };
}
