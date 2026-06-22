import type { ClinicalInferenceResult } from "@/lib/v17/clinical/types";
import type { GraphNormalizeResult } from "@/lib/v17/graph/types";
import type { ReasoningPipelinePayload } from "@/lib/v17/reasoning/types";

export type AcpMetadata = {
  source?: string;
  locale?: string;
  requestId?: string;
  [key: string]: unknown;
};

export type AcpClinicalContext = {
  specialty?: string;
  patientAge?: number;
  setting?: string;
  [key: string]: unknown;
};

export type AcpRequest = {
  text?: string;
  metadata?: AcpMetadata;
  clinicalContext?: AcpClinicalContext;
};

export type ValidationResult = {
  valid: boolean;
  issues: string[];
};

export type ComplianceResult = {
  compliant: boolean;
  reasons: string[];
  guidelineMatches: Array<{ note: string; items: string[] }>;
};

export type ClinicalSummary = {
  headline: string;
  primaryDiagnoses: string[];
  recommendedTreatments: string[];
  keyRisks: string[];
  guidelineAlignment: string[];
  reasoningChain: string[];
  narrative: string;
};

export type AcpAuditRecord = {
  pipelineVersion: string;
  nodesUsed: string[];
  edgesUsed: string[];
  scoring: {
    esl: { w: number; s: number; r: number; g: number };
  };
  inferenceChain: string[];
  constants: Record<string, unknown>;
  validationIssues: string[];
};

export type AcpPayload = {
  reasoning: ReasoningPipelinePayload;
  graph: GraphNormalizeResult;
  inference: ClinicalInferenceResult;
  compliance: ComplianceResult;
  summary: ClinicalSummary;
  audit: AcpAuditRecord;
};

export type AcpAggregated = {
  reasoning: ReasoningPipelinePayload;
  graph: GraphNormalizeResult;
  inference: ClinicalInferenceResult;
  compliance: ComplianceResult;
  summary: ClinicalSummary;
};

export type AcpSuccessResult = {
  status: "ok";
  acp: AcpPayload;
};

export type AcpErrorResult = {
  status: "error";
  issues: string[];
};

export type AcpResult = AcpSuccessResult | AcpErrorResult;

export const ACP_PIPELINE_VERSION = "v17-acp-1.0.0";
