import fs from "fs";
import path from "path";
import { getMemoryAuditLog, writeAuditLog } from "@/lib/v17/audit/logger";
import { checkRateLimit } from "@/lib/v17/security/rate-limit";
import { getMonitorStats } from "@/lib/v17/monitoring/hooks";
import { getVersion } from "@/lib/v17/versioning/version";
import { dataPath, MEDSCOPE_PROJECT_ROOT } from "@/lib/config/paths";

export type HealthcheckResult = {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  checks: {
    acp: { ok: boolean; details: string };
    mkg: { ok: boolean; details: string };
    inference: { ok: boolean; details: string };
    audit: { ok: boolean; details: string };
    storage: { ok: boolean; details: string };
    rateLimit: { ok: boolean; details: string };
    latency: { ok: boolean; ms: number };
  };
};

const ROOT = MEDSCOPE_PROJECT_ROOT;

function fileOk(relativePath: string): boolean {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function readExportExists(relativePath: string, exportName: string): boolean {
  try {
    const content = fs.readFileSync(path.join(ROOT, relativePath), "utf8");
    return content.includes(`export function ${exportName}`) || content.includes(`export async function ${exportName}`);
  } catch {
    return false;
  }
}

/** Production health probe for V17 stack (no external deps). */
export async function runHealthcheck(): Promise<HealthcheckResult> {
  const started = Date.now();
  const version = getVersion();
  const timestamp = new Date().toISOString();

  const acpOk =
    fileOk("lib/v17/acp/orchestrator.ts") &&
    readExportExists("lib/v17/acp/orchestrator.ts", "runAcpPipeline");
  const mkgOk =
    fileOk("lib/v17/graph/builder.ts") &&
    fileOk("lib/v17/graph/linker.ts") &&
    fileOk("lib/v17/graph/linking/edge-scoring.ts");
  let inferenceOk =
    fileOk("lib/v17/clinical/diagnosis.ts") &&
    fileOk("lib/v17/clinical/treatment.ts") &&
    fileOk("lib/v17/clinical/risk.ts");
  let inferenceDetails = inferenceOk
    ? "Inference modules present"
    : "Inference modules missing";

  if (inferenceOk) {
    try {
      const { computeRiskScore } = await import("@/lib/v17/clinical/risk");
      const score = computeRiskScore("moderate", 0.5);
      if (typeof score !== "number" || Number.isNaN(score)) {
        inferenceOk = false;
        inferenceDetails = "Inference probe returned invalid risk score";
      } else {
        inferenceDetails = `Inference probe ok (riskScore=${score})`;
      }
    } catch (error) {
      inferenceOk = false;
      inferenceDetails =
        error instanceof Error ? error.message : "Inference runtime probe failed";
    }
  }

  let auditOk = false;
  let auditDetails = "audit logger unavailable";
  try {
    await writeAuditLog({
      requestId: `health-${started}`,
      nodesUsed: [],
      edgesUsed: [],
      edgeScores: [],
      inferenceChain: ["healthcheck"],
      constants: { probe: true },
      version,
    });
    auditOk = getMemoryAuditLog().length > 0;
    auditDetails = auditOk ? "audit logger writable" : "audit memory buffer empty";
  } catch (error) {
    auditDetails = error instanceof Error ? error.message : "audit write failed";
  }

  let storageOk = false;
  let storageDetails = "storage probe skipped";
  try {
    const dir = dataPath("v17-audit");
    fs.mkdirSync(dir, { recursive: true });
    const probe = path.join(dir, ".health-probe");
    fs.writeFileSync(probe, "ok", "utf8");
    fs.unlinkSync(probe);
    storageOk = true;
    storageDetails = "audit storage writable";
  } catch (error) {
    storageDetails = error instanceof Error ? error.message : "storage not writable";
  }

  const rate = await checkRateLimit("healthcheck-probe", "health");
  const rateOk = rate.allowed;

  const latencyMs = Date.now() - started;
  const monitor = getMonitorStats();
  const latencyOk = latencyMs < 500;
  const latencyDegraded = latencyMs >= 500 && latencyMs < 2000;

  const checks = {
    acp: {
      ok: acpOk,
      details: acpOk ? "ACP orchestrator present" : "ACP orchestrator missing",
    },
    mkg: {
      ok: mkgOk,
      details: mkgOk ? "MKG modules present" : "MKG modules missing",
    },
    inference: {
      ok: inferenceOk,
      details: inferenceDetails,
    },
    audit: { ok: auditOk, details: auditDetails },
    storage: { ok: storageOk, details: storageDetails },
    rateLimit: {
      ok: rateOk,
      details: rateOk ? "Rate limiter responsive" : "Rate limiter blocked probe",
    },
    latency: {
      ok: latencyOk,
      ms: latencyMs,
    },
  };

  const criticalFailed = !acpOk || !inferenceOk || !auditOk || !storageOk;
  const warnings = !mkgOk || !rateOk || latencyDegraded || monitor.errors > 0;

  let status: HealthcheckResult["status"] = "healthy";
  if (criticalFailed) status = "unhealthy";
  else if (warnings || !latencyOk) status = "degraded";

  return { status, timestamp, version, checks };
}
