import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { writeAuditLog } from "@/lib/v17/audit/logger";
import { applyFallbackChain } from "@/lib/v17/fallback/fallback";
import { runHealthcheck } from "@/lib/v17/health/healthcheck";
import { monitor } from "@/lib/v17/monitoring/hooks";
import { formatProductionOutput } from "@/lib/v17/output/formatter";
import { runProductionAcp } from "@/lib/v17/production/run-production-acp";
import { validateClinicalSafety } from "@/lib/v17/security/clinical-guardrails";
import { checkRateLimit } from "@/lib/v17/security/rate-limit";
import { sanitizeInput } from "@/lib/v17/security/sanitize";
import { getVersion } from "@/lib/v17/versioning/version";

export type PreDeployCheckResult = {
  ready: boolean;
  issues: string[];
  mode: "serverless" | "local";
};

const root = process.cwd();

const BLUEPRINT_FILES = [
  "lib/v17/security/sanitize.ts",
  "lib/v17/security/clinical-guardrails.ts",
  "lib/v17/security/rate-limit.ts",
  "lib/v17/audit/logger.ts",
  "lib/v17/fallback/fallback.ts",
  "lib/v17/monitoring/hooks.ts",
  "lib/v17/versioning/version.ts",
  "lib/v17/output/formatter.ts",
  "lib/v17/health/healthcheck.ts",
  "lib/v17/production/run-production-acp.ts",
  "app/api/v17/health/route.ts",
];

function isServerlessRuntime(): boolean {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(root, relativePath));
}

function runNodeScript(script: string): { ok: boolean; output: string } {
  const scriptPath = path.join(root, "scripts", script);
  try {
    const output = execSync(`"${process.execPath}" "${scriptPath}"`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { ok: true, output };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    return {
      ok: false,
      output: [err.stdout, err.stderr, err.message].filter(Boolean).join("\n"),
    };
  }
}

function checkBlueprintFiles(issues: string[]): void {
  for (const rel of BLUEPRINT_FILES) {
    if (!fileExists(rel)) issues.push(`Missing blueprint module: ${rel}`);
  }
}

function checkClinicalSafetyFixture(issues: string[]): void {
  const fixture = validateClinicalSafety({
    acp: {
      reasoning: {
        extracted: { symptoms: [], diagnoses: [], treatments: ["aspirin"], risks: [], facts: [] },
        evaluated: { items: [] },
        inferred: { conclusion: "test", reasoningChain: [], confidence: 0.5 },
      },
      graph: { nodes: [], edges: [] },
      inference: {
        diagnosis: [],
        treatment: [{ treatment: "aspirin" }],
        risk: { riskScore: 0.2, riskFactors: [] },
      },
      summary: { recommendedTreatments: ["aspirin"] },
    },
  });
  if (fixture.safe) {
    issues.push("Clinical safety fixture must fail treatment-without-diagnosis");
  }
}

/** Verify bundled blueprint exports (static imports — safe on Vercel). */
function verifyBundledExports(issues: string[]): void {
  const required: Array<[string, unknown]> = [
    ["sanitizeInput", sanitizeInput],
    ["validateClinicalSafety", validateClinicalSafety],
    ["checkRateLimit", checkRateLimit],
    ["writeAuditLog", writeAuditLog],
    ["applyFallbackChain", applyFallbackChain],
    ["monitor", monitor],
    ["getVersion", getVersion],
    ["formatProductionOutput", formatProductionOutput],
    ["runHealthcheck", runHealthcheck],
    ["runProductionAcp", runProductionAcp],
  ];
  for (const [name, fn] of required) {
    if (typeof fn !== "function") {
      issues.push(`Missing bundled export: ${name}`);
    }
  }
}

function runServerlessChecks(issues: string[]): void {
  const version = getVersion();
  if (!version) {
    issues.push("getVersion() returned empty value");
  }
  verifyBundledExports(issues);
  checkClinicalSafetyFixture(issues);
}

function runLocalChecks(issues: string[]): void {
  const scripts = ["verify-v17-skeleton.mjs", "verify-acp.mjs", "verify-clinical-safety.mjs"];
  for (const script of scripts) {
    const result = runNodeScript(script);
    if (!result.ok) issues.push(`${script} failed: ${result.output}`);
  }
  checkBlueprintFiles(issues);
  checkClinicalSafetyFixture(issues);
}

/** Run all V17 pre-deploy verification (serverless-safe on Vercel). */
export async function preDeployCheck(): Promise<PreDeployCheckResult> {
  const issues: string[] = [];
  const mode = isServerlessRuntime() ? "serverless" : "local";

  if (mode === "serverless") {
    runServerlessChecks(issues);
  } else {
    runLocalChecks(issues);
  }

  return { ready: issues.length === 0, issues, mode };
}

export default preDeployCheck;
