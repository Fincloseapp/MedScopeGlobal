import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { validateClinicalSafety } from "@/lib/v17/security/clinical-guardrails";

export type PreDeployCheckResult = {
  ready: boolean;
  issues: string[];
};

const root = process.cwd();

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(root, relativePath));
}

function runNodeScript(script: string): { ok: boolean; output: string } {
  try {
    const output = execSync(`node scripts/${script}`, {
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

/** Run all V17 pre-deploy verification scripts. */
export async function preDeployCheck(): Promise<PreDeployCheckResult> {
  const issues: string[] = [];

  const skeleton = runNodeScript("verify-v17-skeleton.mjs");
  if (!skeleton.ok) issues.push(`verify-v17-skeleton failed: ${skeleton.output}`);

  const acp = runNodeScript("verify-acp.mjs");
  if (!acp.ok) issues.push(`verify-acp failed: ${acp.output}`);

  const safety = runNodeScript("verify-clinical-safety.mjs");
  if (!safety.ok) issues.push(`verify-clinical-safety failed: ${safety.output}`);

  const blueprintFiles = [
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
  for (const rel of blueprintFiles) {
    if (!fileExists(rel)) issues.push(`Missing blueprint module: ${rel}`);
  }

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

  return { ready: issues.length === 0, issues };
}

export default preDeployCheck;
