import clinicalEdge from "@/edge/v17/clinical-edge";
import type { ClinicalPipelineResult } from "@/edge/v17/clinical-edge";

/** V17 clinical job — runs Enhanced Inference Layer via clinical-edge. */
export default async function clinicalJob(input = ""): Promise<ClinicalPipelineResult> {
  return clinicalEdge(input);
}
