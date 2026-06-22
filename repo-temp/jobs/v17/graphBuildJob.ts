import graphEdge from "@/edge/v17/graph-edge";
import type { GraphPipelineResult } from "@/edge/v17/graph-edge";

/** V17 graph build job — runs MKG pipeline via graph-edge. */
export default async function graphBuildJob(input = ""): Promise<GraphPipelineResult> {
  return graphEdge(input);
}
