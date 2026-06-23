import type { ComplianceResult } from "@/lib/v17/acp/types";
import type { ClinicalInferenceResult } from "@/lib/v17/clinical/types";
import { edgeKey } from "@/lib/v17/clinical/graph-context";
import type { GraphNormalizeResult } from "@/lib/v17/graph/types";
import type { ReasoningPipelinePayload } from "@/lib/v17/reasoning/types";

export type ComplianceInput = {
  reasoning: ReasoningPipelinePayload;
  graph: GraphNormalizeResult;
  inference: ClinicalInferenceResult;
};

const EVIDENCE_STRENGTH_THRESHOLD = 0.35;
const RISK_BENEFIT_THRESHOLD = 0.55;

/** Evaluate guideline compliance from evidence, edges, and risk-benefit profile. */
export function evaluateCompliance(input: ComplianceInput): ComplianceResult {
  const reasons: string[] = [];
  const guidelineMatches = input.reasoning.compared.alignments
    .filter((alignment) => /guideline|doporučení|recommendation/i.test(alignment.note))
    .map((alignment) => ({
      note: alignment.note,
      items: alignment.items,
    }));

  const supportedGuidelineEdges = input.graph.edges.filter(
    (edge) => edge.metadata.guidelineSupport
  );

  const moderateOrHighEvidence = input.reasoning.evaluated.items.filter(
    (item) =>
      (item.evidenceLevel === "high" || item.evidenceLevel === "moderate") &&
      item.relevance >= EVIDENCE_STRENGTH_THRESHOLD
  );

  const hasEvidenceStrength = moderateOrHighEvidence.length > 0;
  const hasGuidelineSupport =
    guidelineMatches.length > 0 || supportedGuidelineEdges.length > 0;

  const riskBenefitAligned =
    input.inference.risk.riskScore <= RISK_BENEFIT_THRESHOLD ||
    input.inference.risk.mitigation.length > 0;

  const treatmentWithGuideline = input.inference.treatment.some(
    (item) => item.guidelineSupport
  );
  const hasTreatmentPlan = input.inference.treatment.length > 0;

  if (!hasEvidenceStrength) {
    reasons.push("Insufficient moderate/high evidence strength in evaluated items");
  }
  if (!hasGuidelineSupport) {
    reasons.push("No guideline alignment detected in compared outputs or graph edges");
  }
  if (!riskBenefitAligned) {
    reasons.push("Risk-benefit profile exceeds threshold without documented mitigation");
  }
  if (hasTreatmentPlan && !treatmentWithGuideline) {
    reasons.push("Treatment plan lacks explicit guideline support");
  }

  const compliant =
    hasEvidenceStrength &&
    hasGuidelineSupport &&
    riskBenefitAligned &&
    (!hasTreatmentPlan || treatmentWithGuideline);

  if (compliant && supportedGuidelineEdges.length > 0) {
    reasons.push(
      `Guideline edges: ${supportedGuidelineEdges.map(edgeKey).join(", ")}`
    );
  }

  return {
    compliant,
    reasons,
    guidelineMatches,
  };
}
