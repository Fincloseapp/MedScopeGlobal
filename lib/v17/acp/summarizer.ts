import type { ClinicalSummary, ComplianceResult } from "@/lib/v17/acp/types";
import type { ClinicalInferenceResult } from "@/lib/v17/clinical/types";
import type { ReasoningPipelinePayload } from "@/lib/v17/reasoning/types";

export type SummarizeInput = {
  reasoning: ReasoningPipelinePayload;
  inference: ClinicalInferenceResult;
  compliance: ComplianceResult;
};

function topDiagnoses(inference: ClinicalInferenceResult, limit = 3): string[] {
  return inference.diagnosis.slice(0, limit).map((item) => item.diagnosis);
}

function topTreatments(inference: ClinicalInferenceResult, limit = 3): string[] {
  return inference.treatment.slice(0, limit).map((item) => item.treatment);
}

function topRisks(inference: ClinicalInferenceResult, limit = 3): string[] {
  return inference.risk.riskFactors.slice(0, limit).map((item) => item.factor);
}

/** Build deterministic clinical summary from inference + reasoning outputs. */
export function buildClinicalSummary(input: SummarizeInput): ClinicalSummary {
  const primaryDiagnoses = topDiagnoses(input.inference);
  const recommendedTreatments = topTreatments(input.inference);
  const keyRisks = topRisks(input.inference);
  const guidelineAlignment = input.compliance.guidelineMatches.map(
    (match) => `${match.note}: ${match.items.join(", ")}`
  );
  const reasoningChain = [
    ...input.reasoning.inferred.reasoningChain,
    input.reasoning.inferred.conclusion,
  ].filter(Boolean);

  const headline =
    primaryDiagnoses.length > 0
      ? `Clinical assessment: ${primaryDiagnoses[0]}`
      : "Clinical assessment: no definitive diagnosis extracted";

  const narrativeParts = [
    headline,
    primaryDiagnoses.length
      ? `Primary diagnoses: ${primaryDiagnoses.join("; ")}.`
      : "No primary diagnoses identified.",
    recommendedTreatments.length
      ? `Recommended treatment: ${recommendedTreatments.join("; ")}.`
      : "No treatment recommendations generated.",
    keyRisks.length ? `Key risks: ${keyRisks.join("; ")}.` : "No significant risks identified.",
    guidelineAlignment.length
      ? `Guideline alignment: ${guidelineAlignment.join(" | ")}.`
      : "No explicit guideline alignment detected.",
    input.compliance.compliant
      ? "Guideline compliance: compliant."
      : "Guideline compliance: review required.",
    `Overall risk score: ${input.inference.risk.riskScore.toFixed(2)}.`,
    reasoningChain.length
      ? `Reasoning: ${reasoningChain.join(" → ")}`
      : "Reasoning chain unavailable.",
  ];

  return {
    headline,
    primaryDiagnoses,
    recommendedTreatments,
    keyRisks,
    guidelineAlignment,
    reasoningChain,
    narrative: narrativeParts.join(" "),
  };
}
