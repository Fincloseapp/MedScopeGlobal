import {
  computeEvidenceWeight,
  evidenceLevelWeight,
  type EvidenceLevel,
} from "@/lib/v17/clinical/evidence";
import {
  keywordMatchWeight,
  textMentions,
} from "@/lib/v17/graph/linking/text-match";
import type { EvidenceStrength, GraphEdgeMetadata, GraphNode } from "@/lib/v17/graph/types";
import type { ReasoningPipelinePayload } from "@/lib/v17/reasoning/types";

const EVIDENCE_LEVEL_MAP: Record<EvidenceLevel, number> = {
  high: 1,
  moderate: 0.6,
  low: 0.3,
};

const MITIGATION_STRENGTH = 0.5;

function clamp(n: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, n));
}

function asEvidenceLevel(level: string | undefined): EvidenceLevel {
  if (level === "high" || level === "moderate" || level === "low") return level;
  return "low";
}

function maxEvidenceStrength(a: EvidenceLevel, b: EvidenceLevel): EvidenceStrength {
  const rank = { low: 1, moderate: 2, high: 3 };
  return rank[a] >= rank[b] ? a : b;
}

function hasGuidelineAlignment(
  pipeline: ReasoningPipelinePayload | undefined,
  a: string,
  b: string
): boolean {
  if (!pipeline) return false;
  return pipeline.compared.alignments.some((alignment) => {
    const isGuideline = /guideline|doporučení|recommendation/i.test(alignment.note);
    if (!isGuideline) return false;
    const hasA = alignment.items.some((item) => textMentions(item, a));
    const hasB = alignment.items.some((item) => textMentions(item, b));
    return hasA && hasB;
  });
}

function evidenceAlignmentScore(
  pipeline: ReasoningPipelinePayload | undefined,
  a: string,
  b: string
): number {
  if (!pipeline) return 0;
  let score = 0;
  for (const item of pipeline.evaluated.items) {
    if (textMentions(item.item, a) && textMentions(item.item, b)) {
      score = Math.max(score, item.relevance);
    }
  }
  for (const alignment of pipeline.compared.alignments) {
    const hasA = alignment.items.some((item) => textMentions(item, a));
    const hasB = alignment.items.some((item) => textMentions(item, b));
    if (hasA && hasB) {
      score = Math.max(score, /guideline|doporučení|recommendation/i.test(alignment.note) ? 0.85 : 0.55);
    }
  }
  return clamp(score);
}

function guidelineSupportFromNodes(
  guidelineNodes: GraphNode[],
  diagnosis: string,
  treatment: string
): boolean {
  return guidelineNodes.some((guideline) => {
    const value = guideline.value;
    if (typeof value !== "object" || value === null || !Array.isArray(value.items)) return false;
    const items = value.items as string[];
    return (
      items.some((item) => textMentions(item, diagnosis)) &&
      items.some((item) => textMentions(item, treatment))
    );
  });
}

/** Metadata for evidence → conclusion (supports). */
export function evidenceConclusionMetadata(
  level: EvidenceLevel | string,
  relevance: number
): GraphEdgeMetadata {
  const strength = asEvidenceLevel(level);
  return {
    weight: clamp(computeEvidenceWeight(strength, relevance)),
    score: clamp(relevance),
    evidenceStrength: strength,
    riskImpact: 0,
    guidelineSupport: false,
  };
}

/** Metadata for symptom → diagnosis (indicates). */
export function symptomDiagnosisMetadata(
  symptom: string,
  diagnosis: string,
  pipeline?: ReasoningPipelinePayload
): GraphEdgeMetadata {
  const alignmentScore = evidenceAlignmentScore(pipeline, symptom, diagnosis);
  const guidelineSupport = hasGuidelineAlignment(pipeline, symptom, diagnosis);

  return {
    weight: clamp(keywordMatchWeight(symptom, diagnosis)),
    score: clamp(alignmentScore),
    evidenceStrength: alignmentScore >= 0.65 ? "moderate" : "low",
    riskImpact: 0,
    guidelineSupport,
  };
}

/** Metadata for diagnosis → treatment (treated_by). */
export function diagnosisTreatmentMetadata(
  diagnosis: string,
  treatment: string,
  pipeline: ReasoningPipelinePayload | undefined,
  guidelineNodes: GraphNode[],
  avgRiskScore: number
): GraphEdgeMetadata {
  const diagItem = pipeline?.evaluated.items.find(
    (item) => item.category === "diagnosis" && item.item === diagnosis
  );
  const treatItem = pipeline?.evaluated.items.find(
    (item) => item.category === "treatment" && item.item === treatment
  );
  const diagLevel = asEvidenceLevel(diagItem?.evidenceLevel);
  const treatLevel = asEvidenceLevel(treatItem?.evidenceLevel);
  const guidelineSupport =
    hasGuidelineAlignment(pipeline, diagnosis, treatment) ||
    guidelineSupportFromNodes(guidelineNodes, diagnosis, treatment);

  const weight = clamp((EVIDENCE_LEVEL_MAP[diagLevel] + EVIDENCE_LEVEL_MAP[treatLevel]) / 2);

  return {
    weight,
    score: guidelineSupport ? 1 : 0.5,
    evidenceStrength: maxEvidenceStrength(diagLevel, treatLevel),
    riskImpact: clamp(1 - avgRiskScore),
    guidelineSupport,
  };
}

/** Metadata for risk → outcome (increases_risk). */
export function riskOutcomeMetadata(riskScore: number): GraphEdgeMetadata {
  const normalized = clamp(riskScore);
  return {
    weight: normalized,
    score: normalized,
    evidenceStrength: "low",
    riskImpact: normalized,
    guidelineSupport: false,
  };
}

/** Metadata for risk → treatment (mitigated_by). */
export function riskMitigationMetadata(riskScore: number): GraphEdgeMetadata {
  const normalized = clamp(riskScore);
  return {
    weight: MITIGATION_STRENGTH,
    score: clamp(1 - normalized),
    evidenceStrength: "low",
    riskImpact: -normalized,
    guidelineSupport: false,
  };
}

/** Re-export for linker audit helpers. */
export { evidenceLevelWeight, EVIDENCE_LEVEL_MAP };
