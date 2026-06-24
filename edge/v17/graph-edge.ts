import { buildGraph } from "@/lib/v17/graph/builder";
import { linkGraph } from "@/lib/v17/graph/linker";
import { normalizeGraph } from "@/lib/v17/graph/normalizer";
import type { GraphNormalizeResult } from "@/lib/v17/graph/types";
import reasoningEdge from "@/edge/v17/reasoning-edge";
import type { ReasoningPipelinePayload } from "@/lib/v17/reasoning/types";

export type GraphPipelineResult = {
  status: "ok";
  graph: GraphNormalizeResult;
  reasoning: ReasoningPipelinePayload;
};

/** V17 MKG edge — reasoning → build → link → normalize. */
export default async function graphEdge(input = ""): Promise<GraphPipelineResult> {
  const { pipeline } = await reasoningEdge(input);
  const built = await buildGraph(pipeline);
  const linked = await linkGraph(built.nodes, pipeline);
  const graph = await normalizeGraph(linked);

  return {
    status: "ok",
    graph,
    reasoning: pipeline,
  };
}
