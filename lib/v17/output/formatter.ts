import type { AcpPayload } from "@/lib/v17/acp/types";
import { applyFallback } from "@/lib/v17/fallback/fallback";
import { validateClinicalSafety } from "@/lib/v17/security/clinical-guardrails";
import { sanitizeInput, V17_MAX_INPUT_LENGTH } from "@/lib/v17/security/sanitize";
import { getVersion } from "@/lib/v17/versioning/version";

export type FormattedOutput = {
  status: "ok" | "fallback" | "error";
  version: string;
  requestId: string;
  timestamp: string;
  output: {
    title: string;
    summary: string;
    details: string[];
    recommendations: string[];
    riskScore: number | null;
    redFlags: string[];
  };
  audit: {
    nodesUsed: number;
    edgesUsed: number;
    edgeScores: unknown;
    inferenceChain: unknown;
    constants: unknown;
    fallbackStage: string | null;
  };
};

export type FormatProductionOptions = {
  requestId?: string;
  fallbackStage?: string | null;
  errorIssues?: string[];
};

function cleanText(value: unknown): { text: string; issues: string[] } {
  const raw = String(value ?? "");
  const { clean, issues } = sanitizeInput(raw);
  const text = clean.replace(/\s+/g, " ").trim();
  if (text.length > V17_MAX_INPUT_LENGTH) {
    issues.push(`field exceeds maximum length of ${V17_MAX_INPUT_LENGTH}`);
  }
  return { text: text.slice(0, V17_MAX_INPUT_LENGTH), issues };
}

function stringList(values: unknown[]): { items: string[]; issues: string[] } {
  const items: string[] = [];
  const issues: string[] = [];
  for (const item of values) {
    const cleaned = cleanText(typeof item === "string" ? item : JSON.stringify(item));
    if (cleaned.text) items.push(cleaned.text);
    issues.push(...cleaned.issues);
  }
  return { items, issues };
}

function extractAcp(acpOutput: unknown): AcpPayload | null {
  const root = acpOutput as { acp?: AcpPayload; status?: string };
  if (root?.acp && typeof root.acp === "object") return root.acp;
  if (acpOutput && typeof acpOutput === "object" && "summary" in (acpOutput as object)) {
    return acpOutput as AcpPayload;
  }
  return null;
}

function buildOutputFromAcp(acp: AcpPayload, redFlags: string[]) {
  const titleClean = cleanText(acp.summary?.headline || "Clinical assessment");
  const summaryClean = cleanText(
    acp.summary?.narrative ||
      acp.reasoning?.inferred?.conclusion ||
      "No narrative available."
  );
  const detailsClean = stringList([
    ...(acp.summary?.reasoningChain ?? []),
    ...(acp.summary?.guidelineAlignment ?? []),
    ...(acp.summary?.keyRisks ?? []),
  ]);
  const recommendationsClean = stringList([
    ...(acp.summary?.recommendedTreatments ?? []),
    ...acp.inference.treatment.map((item) => item.treatment),
  ]);
  const riskScore =
    typeof acp.inference?.risk?.riskScore === "number"
      ? acp.inference.risk.riskScore
      : null;

  const sanitizeIssues = [
    ...titleClean.issues,
    ...summaryClean.issues,
    ...detailsClean.issues,
    ...recommendationsClean.issues,
  ];

  return {
    title: titleClean.text,
    summary: summaryClean.text,
    details: detailsClean.items,
    recommendations: recommendationsClean.items,
    riskScore,
    redFlags: stringList([...redFlags, ...sanitizeIssues]).items,
  };
}

function buildAuditBlock(acp: AcpPayload | null, auditMeta: unknown, fallbackStage: string | null) {
  const meta = (auditMeta ?? {}) as Record<string, unknown>;
  const nodes = acp?.audit?.nodesUsed ?? (meta.nodesUsed as string[] | undefined) ?? [];
  const edges = acp?.audit?.edgesUsed ?? (meta.edgesUsed as string[] | undefined) ?? [];
  const edgeScores =
    meta.edgeScores ??
    acp?.graph?.edges?.map((edge) => edge.finalScore) ??
    [];

  return {
    nodesUsed: Array.isArray(nodes) ? nodes.length : 0,
    edgesUsed: Array.isArray(edges) ? edges.length : 0,
    edgeScores,
    inferenceChain: acp?.audit?.inferenceChain ?? meta.inferenceChain ?? [],
    constants: acp?.audit?.constants ?? meta.constants ?? {},
    fallbackStage,
  };
}

/** Format ACP output for production consumers (sanitized + guardrailed). */
export function formatProductionOutput(
  acpOutput: unknown,
  auditMeta: unknown = {},
  fallbackStage: string | null = null,
  options: FormatProductionOptions = {}
): FormattedOutput {
  const requestId =
    cleanText(options.requestId ?? `v17-${Date.now()}`).text || `v17-${Date.now()}`;
  const timestamp = new Date().toISOString();
  const version = getVersion();
  const errorIssues = options.errorIssues ?? [];

  if (errorIssues.length > 0) {
    const safe = applyFallback({ acp: extractAcp(acpOutput) ?? {} }, "safe-summary");
    const acp = safe.acp as AcpPayload;
    const redFlags = stringList(errorIssues).items;
    return {
      status: "error",
      version,
      requestId,
      timestamp,
      output: buildOutputFromAcp(acp, redFlags),
      audit: buildAuditBlock(acp, auditMeta, "safe_summary"),
    };
  }

  let acp = extractAcp(acpOutput);
  let stage = fallbackStage;
  let redFlags: string[] = [];

  if (!acp) {
    const safe = applyFallback({ acp: {} }, "safe-summary");
    acp = safe.acp as AcpPayload;
    stage = "safe_summary";
    redFlags.push("ACP output missing — safe summary applied");
    return {
      status: "error",
      version,
      requestId,
      timestamp,
      output: buildOutputFromAcp(acp, redFlags),
      audit: buildAuditBlock(acp, auditMeta, stage),
    };
  }

  const safety = validateClinicalSafety({ acp });
  if (!safety.safe) {
    redFlags = stringList(safety.issues).items;
    if (!stage) {
      const safe = applyFallback({ acp }, "safe-summary");
      acp = safe.acp as AcpPayload;
      stage = "safe_summary";
    }
    return {
      status: "fallback",
      version,
      requestId,
      timestamp,
      output: buildOutputFromAcp(acp, redFlags),
      audit: buildAuditBlock(acp, auditMeta, stage),
    };
  }

  if (stage) {
    const fb = applyFallback({ acp }, stage);
    acp = fb.acp as AcpPayload;
    return {
      status: "fallback",
      version,
      requestId,
      timestamp,
      output: buildOutputFromAcp(acp, redFlags),
      audit: buildAuditBlock(acp, auditMeta, stage),
    };
  }

  return {
    status: "ok",
    version,
    requestId,
    timestamp,
    output: buildOutputFromAcp(acp, redFlags),
    audit: buildAuditBlock(acp, auditMeta, null),
  };
}
