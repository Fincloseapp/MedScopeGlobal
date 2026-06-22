import type { AcpAggregated, AcpPayload, ComplianceResult, ClinicalSummary } from "@/lib/v17/acp/types";
import type { ClinicalInferenceResult } from "@/lib/v17/clinical/types";
import type { GraphNormalizeResult } from "@/lib/v17/graph/types";
import type { ReasoningPipelinePayload } from "@/lib/v17/reasoning/types";

export type AggregateInput = {
  reasoning: ReasoningPipelinePayload;
  graph: GraphNormalizeResult;
  inference: ClinicalInferenceResult;
  compliance: ComplianceResult;
  summary: ClinicalSummary;
};

/** Merge reasoning, MKG, inference, compliance, and summary into one object. */
export function aggregateAcpResults(input: AggregateInput): AcpAggregated {
  return {
    reasoning: input.reasoning,
    graph: input.graph,
    inference: input.inference,
    compliance: input.compliance,
    summary: input.summary,
  };
}

/** Attach audit record to aggregated ACP payload. */
export function attachAudit(
  aggregated: AcpAggregated,
  audit: AcpPayload["audit"]
): AcpPayload {
  return {
    ...aggregated,
    audit,
  };
}
