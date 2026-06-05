import type { AcpRequest, AcpResult } from "@/lib/v17/acp/types";
import { writeAuditLog } from "@/lib/v17/audit/logger";
import { applyFallbackChain } from "@/lib/v17/fallback/fallback";
import {
  monitor,
  monitorAuditIntegrity,
  monitorMkgConsistency,
} from "@/lib/v17/monitoring/hooks";
import { validateClinicalSafety } from "@/lib/v17/security/clinical-guardrails";
import { checkRateLimit } from "@/lib/v17/security/rate-limit";
import { sanitizeInput } from "@/lib/v17/security/sanitize";
import { getVersion } from "@/lib/v17/versioning/version";
import acpJob from "@/jobs/v17/acpJob";

export type ProductionAcpOptions = {
  ip?: string;
  requestId?: string;
};

export type ProductionAcpResult =
  | { status: "ok"; result: AcpResult; fallbackApplied?: boolean; safetyIssues?: string[] }
  | { status: "error"; issues: string[]; code: "rate_limited" | "validation" | "pipeline" };

/** Production wrapper around ACP (no changes to ACP itself). */
export async function runProductionAcp(
  request: AcpRequest,
  options: ProductionAcpOptions = {}
): Promise<ProductionAcpResult> {
  const started = Date.now();
  const requestId = options.requestId ?? request.metadata?.requestId ?? `v17-${started}`;
  monitor("job_start", { requestId, job: "acp" });

  const rate = checkRateLimit(options.ip ?? "unknown");
  if (!rate.allowed) {
    monitor("rate_limited", { requestId, ip: options.ip });
    return { status: "error", issues: ["Rate limit exceeded"], code: "rate_limited" };
  }

  const sanitized = sanitizeInput(request.text ?? "");
  if (sanitized.issues.some((issue) => issue.includes("exceeds maximum length"))) {
    return { status: "error", issues: sanitized.issues, code: "validation" };
  }

  const result = await acpJob({ ...request, text: sanitized.clean });

  if (result.status === "error") {
    monitor("job_error", { requestId, issues: result.issues });
    return { status: "error", issues: result.issues, code: "pipeline" };
  }

  monitorMkgConsistency(result.acp.graph);
  monitorAuditIntegrity(result.acp.audit);

  const safety = validateClinicalSafety(result);
  let finalResult = result;
  let fallbackApplied = false;
  let safetyIssues = safety.issues;

  if (!safety.safe) {
    monitor("clinical_unsafe", { requestId, issues: safety.issues });
    const fallback = applyFallbackChain(result.acp);
    finalResult = { status: "ok", acp: fallback.acp };
    fallbackApplied = true;
    safetyIssues = [...safety.issues, fallback.note];
  }

  await writeAuditLog({
    requestId,
    nodesUsed: finalResult.acp.audit.nodesUsed,
    edgesUsed: finalResult.acp.audit.edgesUsed,
    edgeScores: finalResult.acp.graph.edges.map((edge) => edge.finalScore),
    inferenceChain: finalResult.acp.audit.inferenceChain,
    constants: {
      ...finalResult.acp.audit.constants,
      version: getVersion(),
      fallbackApplied,
      safetyIssues,
    },
  });

  monitor("job_end", {
    requestId,
    durationMs: Date.now() - started,
    fallbackApplied,
    safe: safety.safe,
  });

  return {
    status: "ok",
    result: finalResult,
    fallbackApplied,
    safetyIssues: safetyIssues.length ? safetyIssues : undefined,
  };
}
