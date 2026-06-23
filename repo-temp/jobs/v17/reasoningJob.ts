import reasoningEdge from "@/edge/v17/reasoning-edge";
import type { ReasoningPipelineResult } from "@/edge/v17/reasoning-edge";

/** V17 reasoning job — invokes reasoning edge pipeline. */
export default async function reasoningJob(input = ""): Promise<ReasoningPipelineResult> {
  return reasoningEdge(input);
}
