import type { DiagnosisCandidate } from "@/lib/v17/clinical/types";
import { computeEvidenceWeight } from "@/lib/v17/clinical/evidence";
import {
  diagnosisText,
  edgeKey,
  findDiagnosisNode,
  nodeById,
  nodesByType,
  symptomText,
} from "@/lib/v17/clinical/graph-context";
import { textMentions } from "@/lib/v17/graph/linking/text-match";
import type { EvidenceStrength, GraphNormalizeResult } from "@/lib/v17/graph/types";
import type { ReasoningPipelinePayload } from "@/lib/v17/reasoning/types";

function clamp(n: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, n));
}

function evidenceStrengthBonus(strength: EvidenceStrength): number {
  if (strength === "high") return 0.15;
  if (strength === "moderate") return 0.08;
  return 0;
}

export type GenerateDiagnosisInput = ReasoningPipelinePayload & {
  graph: GraphNormalizeResult;
  weightedEvidence?: Array<{ item: string; weight: number }>;
};

function supportingEvidenceForDiagnosis(
  diagnosis: string,
  input: GenerateDiagnosisInput
): string[] {
  const fromWeighted =
    input.weightedEvidence
      ?.filter((item) => textMentions(item.item, diagnosis))
      .map((item) => item.item) ?? [];

  const fromEvaluated = input.evaluated.items
    .filter(
      (item) =>
        (item.category === "diagnosis" || item.category === "fact") &&
        textMentions(item.item, diagnosis)
    )
    .map((item) => item.item);

  return [...new Set([...fromWeighted, ...fromEvaluated])];
}

function scoreDiagnosis(
  diagnosis: string,
  nodeId: string | undefined,
  input: GenerateDiagnosisInput
): DiagnosisCandidate {
  const { graph, evaluated, compared, inferred } = input;
  const indicateEdges = graph.edges.filter(
    (edge) => edge.relation === "indicates" && (!nodeId || edge.to === nodeId)
  );

  let confidence = 0;
  const nodeIds: string[] = nodeId ? [nodeId] : [];
  const edgesUsed: string[] = [];
  const supportingSymptoms: string[] = [];

  if (indicateEdges.length > 0) {
    const avgFinalScore =
      indicateEdges.reduce((sum, edge) => sum + edge.finalScore, 0) / indicateEdges.length;
    confidence += avgFinalScore * 0.45;

    for (const edge of indicateEdges) {
      edgesUsed.push(edgeKey(edge));
      const symptomNode = nodeById(graph, edge.from);
      if (symptomNode) {
        nodeIds.push(symptomNode.id);
        supportingSymptoms.push(symptomText(symptomNode));
      }
      confidence += evidenceStrengthBonus(edge.metadata.evidenceStrength) * 0.05;
      if (edge.metadata.guidelineSupport) confidence += 0.06;
      confidence += edge.metadata.riskImpact * 0.04;
    }
  }

  const evaluatedDiagnosis = evaluated.items.filter(
    (item) => item.category === "diagnosis" && textMentions(item.item, diagnosis)
  );
  for (const item of evaluatedDiagnosis) {
    confidence += computeEvidenceWeight(item.evidenceLevel, item.relevance) * 0.2;
  }

  if (textMentions(inferred.conclusion, diagnosis)) {
    confidence += inferred.confidence * 0.18;
  }

  const hasGuideline = compared.alignments.some((alignment) => {
    const isGuideline = /guideline|doporučení|recommendation/i.test(alignment.note);
    return isGuideline && alignment.items.some((item) => textMentions(item, diagnosis));
  });
  if (hasGuideline) confidence += 0.1;

  if (input.extracted.diagnoses.some((d) => d.toLowerCase() === diagnosis.toLowerCase())) {
    confidence += 0.08;
  }

  const supportingEvidence = supportingEvidenceForDiagnosis(diagnosis, input);

  return {
    diagnosis,
    confidence: clamp(confidence),
    supportingSymptoms: [...new Set(supportingSymptoms)],
    supportingEvidence,
    audit: {
      nodeIds: [...new Set(nodeIds)],
      edgesUsed: [...new Set(edgesUsed)],
    },
  };
}

/** Generate ranked diagnosis candidates from MKG + reasoning outputs. */
export async function generateDiagnosis(
  input: GenerateDiagnosisInput
): Promise<DiagnosisCandidate[]> {
  const diagnosisNodes = nodesByType(input.graph, "diagnosis");
  const candidates = new Map<string, DiagnosisCandidate>();

  for (const node of diagnosisNodes) {
    const text = diagnosisText(node);
    candidates.set(text.toLowerCase(), scoreDiagnosis(text, node.id, input));
  }

  for (const extractedDiagnosis of input.extracted.diagnoses) {
    const key = extractedDiagnosis.toLowerCase();
    if (candidates.has(key)) continue;
    const node = findDiagnosisNode(input.graph, extractedDiagnosis);
    candidates.set(key, scoreDiagnosis(extractedDiagnosis, node?.id, input));
  }

  return [...candidates.values()].sort((a, b) => b.confidence - a.confidence);
}

/** V17 clinical diagnosis module — skeleton assess hook. */
export async function assessDiagnosis(_input: unknown): Promise<null> {
  return null;
}
