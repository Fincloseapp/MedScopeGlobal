import type { AcpAuditRecord, AcpPayload, ComplianceResult, ValidationResult } from "@/lib/v17/acp/types";
import { ACP_PIPELINE_VERSION } from "@/lib/v17/acp/types";
import type { ClinicalInferenceResult } from "@/lib/v17/clinical/types";
import { ESL_CONSTANTS } from "@/lib/v17/graph/linking/edge-scoring";
import type { GraphNormalizeResult } from "@/lib/v17/graph/types";
import type { ReasoningPipelinePayload } from "@/lib/v17/reasoning/types";

export type AuditInput = {
  reasoning: ReasoningPipelinePayload;
  graph: GraphNormalizeResult;
  inference: ClinicalInferenceResult;
  compliance: ComplianceResult;
  validation: ValidationResult;
};

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

/** Build deterministic ACP audit record from pipeline artifacts. */
export function buildAcpAudit(input: AuditInput): AcpAuditRecord {
  const inferenceNodeIds = [
    ...input.inference.diagnosis.flatMap((item) => item.audit.nodeIds),
    ...input.inference.treatment.flatMap((item) => item.audit.nodeIds),
    ...input.inference.risk.audit.nodeIds,
  ];

  const inferenceEdgeIds = [
    ...input.inference.diagnosis.flatMap((item) => item.audit.edgesUsed),
    ...input.inference.treatment.flatMap((item) => item.audit.edgesUsed),
    ...input.inference.risk.audit.edgesUsed,
  ];

  const graphEdgeIds = input.graph.edges.map(
    (edge) => `${edge.from}|${edge.relation}|${edge.to}`
  );

  const inferenceChain = [
    "reasoning:extract",
    "reasoning:evaluate",
    "reasoning:compare",
    "reasoning:infer",
    "mkg:build",
    "mkg:link",
    "mkg:normalize",
    "mkg:edge-scoring",
    "eil:diagnosis",
    "eil:treatment",
    "eil:risk",
    "acp:compliance",
    "acp:summary",
    "acp:aggregate",
  ];

  return {
    pipelineVersion: ACP_PIPELINE_VERSION,
    nodesUsed: unique([...input.graph.nodes.map((node) => node.id), ...inferenceNodeIds]),
    edgesUsed: unique([...graphEdgeIds, ...inferenceEdgeIds]),
    scoring: {
      esl: { ...ESL_CONSTANTS },
    },
    inferenceChain,
    constants: {
      pipelineVersion: ACP_PIPELINE_VERSION,
      esl: { ...ESL_CONSTANTS },
      evidenceThreshold: 0.35,
      riskBenefitThreshold: 0.55,
    },
    validationIssues: input.validation.issues,
  };
}

/** Convenience helper to audit a full ACP payload section. */
export function auditFromPayload(payload: Omit<AcpPayload, "audit">, validation: ValidationResult): AcpAuditRecord {
  return buildAcpAudit({
    reasoning: payload.reasoning,
    graph: payload.graph,
    inference: payload.inference,
    compliance: payload.compliance,
    validation,
  });
}
