import { generateDiagnosis } from "@/lib/v17/clinical/diagnosis";
import { weightEvidence } from "@/lib/v17/clinical/evidence";
import { calculateRiskProfile } from "@/lib/v17/clinical/risk";
import { generateTreatmentPlan } from "@/lib/v17/clinical/treatment";
import type { ClinicalInferenceResult } from "@/lib/v17/clinical/types";
import graphEdge from "@/edge/v17/graph-edge";
import type { ReasoningPipelinePayload } from "@/lib/v17/reasoning/types";

export type ClinicalPipelineResult = {
  status: "ok";
  clinical: ClinicalInferenceResult;
  reasoning: ReasoningPipelinePayload;
};

/** V17 Enhanced Inference Layer — reasoning + MKG → clinical outputs. */
export default async function clinicalEdge(input = ""): Promise<ClinicalPipelineResult> {
  const { graph, reasoning } = await graphEdge(input);
  const weightedEvidence = weightEvidence(reasoning.evaluated);

  const diagnosis = await generateDiagnosis({
    ...reasoning,
    graph,
    weightedEvidence,
  });

  const treatment = await generateTreatmentPlan({
    diagnosisList: diagnosis,
    graph,
  });

  const risk = await calculateRiskProfile({
    extracted: reasoning.extracted,
    diagnosisList: diagnosis,
    graph,
  });

  return {
    status: "ok",
    clinical: {
      diagnosis,
      treatment,
      risk,
    },
    reasoning,
  };
}
