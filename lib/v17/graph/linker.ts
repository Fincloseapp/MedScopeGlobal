import { computeEvidenceWeight } from "@/lib/v17/clinical/evidence";
import { computeRiskScore } from "@/lib/v17/clinical/risk";
import {
  diagnosisTreatmentMetadata,
  evidenceConclusionMetadata,
  riskMitigationMetadata,
  riskOutcomeMetadata,
  symptomDiagnosisMetadata,
} from "@/lib/v17/graph/linking/edge-metadata";
import {
  keywordOverlap,
  nodeText,
  textMentions,
} from "@/lib/v17/graph/linking/text-match";
import { applyEdgeScoring } from "@/lib/v17/graph/linking/edge-scoring";
import type { GraphEdgeInput, GraphLinkResult, GraphNode } from "@/lib/v17/graph/types";
import type { ReasoningPipelinePayload } from "@/lib/v17/reasoning/types";

const SYMPTOM_DIAGNOSIS_THRESHOLD = 0.28;
const DIAGNOSIS_TREATMENT_THRESHOLD = 0.32;
const EVIDENCE_SUPPORT_THRESHOLD = 0.22;
const RISK_INCREASE_THRESHOLD = 0.5;
const MITIGATION_OVERLAP_THRESHOLD = 0.25;

const MITIGATION_TERMS =
  /\b(mitig|prevent|prophyl|reduce|sníž|sniz|prevence|profyl|antidot|proti|protiúčink|protiucink)\b/i;

const LEVEL_SCORE = { high: 1, moderate: 0.65, low: 0.35 } as const;

function nodesByType(nodes: GraphNode[], type: GraphNode["type"]): GraphNode[] {
  return nodes.filter((n) => n.type === type);
}

function primaryOutcome(nodes: GraphNode[]): GraphNode | undefined {
  return nodesByType(nodes, "conclusion").find((n) => {
    const v = n.value;
    return typeof v === "object" && v !== null && "confidence" in v;
  });
}

function evaluatedRelevance(
  pipeline: ReasoningPipelinePayload | undefined,
  text: string,
  category: string
): number | undefined {
  if (!pipeline) return undefined;
  const match = pipeline.evaluated.items.find(
    (item) => item.category === category && item.item === text
  );
  return match?.relevance;
}

function symptomDiagnosisScore(
  symptom: string,
  diagnosis: string,
  pipeline: ReasoningPipelinePayload | undefined
): number {
  let score = keywordOverlap(symptom, diagnosis) * 0.45;

  if (pipeline) {
    for (const item of pipeline.evaluated.items) {
      if (item.relevance < 0.25) continue;
      const fact = item.item;
      const mentionsSymptom = textMentions(fact, symptom);
      const mentionsDiagnosis = textMentions(fact, diagnosis);
      if (mentionsSymptom && mentionsDiagnosis) {
        score += 0.25 * item.relevance;
      } else if (mentionsSymptom || mentionsDiagnosis) {
        score += 0.08 * item.relevance;
      }
    }

    for (const alignment of pipeline.compared.alignments) {
      const items = alignment.items;
      const hasSymptom = items.some((i) => textMentions(i, symptom));
      const hasDiagnosis = items.some((i) => textMentions(i, diagnosis));
      if (hasSymptom && hasDiagnosis) {
        score += /guideline|doporučení|recommendation/i.test(alignment.note) ? 0.22 : 0.15;
      }
    }

    for (const risk of pipeline.extracted.risks) {
      const symptomRisk = keywordOverlap(symptom, risk);
      const diagnosisRisk = keywordOverlap(diagnosis, risk);
      if (symptomRisk >= 0.25 || (symptomRisk >= 0.15 && diagnosisRisk >= 0.15)) {
        score += 0.12 * Math.max(symptomRisk, diagnosisRisk);
      }
    }
  }

  return score;
}

function diagnosisTreatmentScore(
  diagnosis: string,
  treatment: string,
  pipeline: ReasoningPipelinePayload | undefined,
  guidelineNodes: GraphNode[],
  avgRiskScore: number
): number {
  let score = keywordOverlap(diagnosis, treatment) * 0.3;

  if (pipeline) {
    const diagItem = pipeline.evaluated.items.find(
      (i) => i.category === "diagnosis" && i.item === diagnosis
    );
    const treatItem = pipeline.evaluated.items.find(
      (i) => i.category === "treatment" && i.item === treatment
    );
    const diagLevel = LEVEL_SCORE[diagItem?.evidenceLevel ?? "low"];
    const treatLevel = LEVEL_SCORE[treatItem?.evidenceLevel ?? "low"];
    score += ((diagLevel + treatLevel) / 2) * 0.35;

    for (const alignment of pipeline.compared.alignments) {
      const items = alignment.items;
      const hasDiagnosis = items.some((i) => textMentions(i, diagnosis));
      const hasTreatment = items.some((i) => textMentions(i, treatment));
      if (hasDiagnosis && hasTreatment) {
        score += 0.2;
      }
    }
  }

  for (const guideline of guidelineNodes) {
    const value = guideline.value;
    if (typeof value !== "object" || value === null || !Array.isArray(value.items)) continue;
    const items = value.items as string[];
    const supports =
      items.some((i) => textMentions(i, diagnosis)) &&
      items.some((i) => textMentions(i, treatment));
    if (supports) score += 0.25;
  }

  if (avgRiskScore < 0.7) {
    score += (0.7 - avgRiskScore) * 0.2;
  } else {
    score *= 0.55;
  }

  return score;
}

function evidenceSupportsConclusion(
  ev: GraphNode,
  conclusionText: string,
  pipeline: ReasoningPipelinePayload | undefined
): boolean {
  const value = ev.value;
  if (typeof value !== "object" || value === null) return false;

  const item = typeof value.item === "string" ? value.item : nodeText(value);
  const level = typeof value.evidenceLevel === "string" ? value.evidenceLevel : "low";
  const relevance =
    typeof value.relevance === "number"
      ? value.relevance
      : (evaluatedRelevance(pipeline, item, String(value.category ?? "fact")) ?? 0.35);

  const weight = computeEvidenceWeight(level, relevance);
  if (weight >= EVIDENCE_SUPPORT_THRESHOLD) return true;
  return textMentions(conclusionText, item) && weight >= EVIDENCE_SUPPORT_THRESHOLD * 0.75;
}

function evidenceNodeFields(
  ev: GraphNode,
  pipeline: ReasoningPipelinePayload | undefined
): { level: string; relevance: number } {
  const value = ev.value;
  if (typeof value !== "object" || value === null) {
    return { level: "low", relevance: 0.35 };
  }
  const item = typeof value.item === "string" ? value.item : nodeText(value);
  const level = typeof value.evidenceLevel === "string" ? value.evidenceLevel : "low";
  const relevance =
    typeof value.relevance === "number"
      ? value.relevance
      : (evaluatedRelevance(pipeline, item, String(value.category ?? "fact")) ?? 0.35);
  return { level, relevance };
}

function findMitigatingTreatment(
  riskText: string,
  treatments: GraphNode[]
): GraphNode | undefined {
  return treatments.find((treatment) => {
    const treatmentText = nodeText(treatment.value);
    const overlap = keywordOverlap(riskText, treatmentText);
    if (overlap >= MITIGATION_OVERLAP_THRESHOLD) return true;
    if (MITIGATION_TERMS.test(treatmentText) && overlap >= 0.12) return true;
    return false;
  });
}

/** Link MKG nodes with scored clinical + evidence relationships and edge metadata. */
export async function linkGraph(
  nodes: GraphNode[],
  pipeline?: ReasoningPipelinePayload
): Promise<GraphLinkResult> {
  const edges: GraphEdgeInput[] = [];
  const symptoms = nodesByType(nodes, "symptom");
  const diagnoses = nodesByType(nodes, "diagnosis");
  const treatments = nodesByType(nodes, "treatment");
  const risks = nodesByType(nodes, "risk");
  const evidence = nodesByType(nodes, "evidence");
  const guidelineAlignments = nodesByType(nodes, "guideline_alignment");
  const outcome = primaryOutcome(nodes);

  for (const symptomNode of symptoms) {
    const symptom = nodeText(symptomNode.value);
    for (const diagnosisNode of diagnoses) {
      const diagnosis = nodeText(diagnosisNode.value);
      const score = symptomDiagnosisScore(symptom, diagnosis, pipeline);
      if (score >= SYMPTOM_DIAGNOSIS_THRESHOLD) {
        edges.push({
          from: symptomNode.id,
          to: diagnosisNode.id,
          relation: "indicates",
          metadata: symptomDiagnosisMetadata(symptom, diagnosis, pipeline),
        });
      }
    }
  }

  const riskScores = risks.map((riskNode) => {
    const riskText = nodeText(riskNode.value);
    const relevance = evaluatedRelevance(pipeline, riskText, "risk") ?? 0.4;
    return computeRiskScore(riskText, relevance);
  });
  const avgRiskScore =
    riskScores.length > 0
      ? riskScores.reduce((sum, s) => sum + s, 0) / riskScores.length
      : 0.35;

  for (const diagnosisNode of diagnoses) {
    const diagnosis = nodeText(diagnosisNode.value);
    for (const treatmentNode of treatments) {
      const treatment = nodeText(treatmentNode.value);
      const score = diagnosisTreatmentScore(
        diagnosis,
        treatment,
        pipeline,
        guidelineAlignments,
        avgRiskScore
      );
      if (score >= DIAGNOSIS_TREATMENT_THRESHOLD) {
        edges.push({
          from: diagnosisNode.id,
          to: treatmentNode.id,
          relation: "treated_by",
          metadata: diagnosisTreatmentMetadata(
            diagnosis,
            treatment,
            pipeline,
            guidelineAlignments,
            avgRiskScore
          ),
        });
      }
    }
  }

  if (outcome) {
    const conclusionText = nodeText(outcome.value);

    for (const ev of evidence) {
      if (evidenceSupportsConclusion(ev, conclusionText, pipeline)) {
        const { level, relevance } = evidenceNodeFields(ev, pipeline);
        edges.push({
          from: ev.id,
          to: outcome.id,
          relation: "supports",
          metadata: evidenceConclusionMetadata(level, relevance),
        });
      }
    }
  }

  for (let i = 0; i < risks.length; i += 1) {
    const riskNode = risks[i];
    const riskText = nodeText(riskNode.value);
    const riskScore = riskScores[i];

    if (outcome && riskScore > RISK_INCREASE_THRESHOLD) {
      edges.push({
        from: riskNode.id,
        to: outcome.id,
        relation: "increases_risk",
        metadata: riskOutcomeMetadata(riskScore),
      });
    }

    const mitigator = findMitigatingTreatment(riskText, treatments);
    if (mitigator) {
      edges.push({
        from: riskNode.id,
        to: mitigator.id,
        relation: "mitigated_by",
        metadata: riskMitigationMetadata(riskScore),
      });
    }
  }

  return { nodes, edges: applyEdgeScoring(edges) };
}
