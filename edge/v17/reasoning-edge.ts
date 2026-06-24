import { compare } from "@/lib/v17/reasoning/comparator";
import { evaluate } from "@/lib/v17/reasoning/evaluator";
import { extract } from "@/lib/v17/reasoning/extractor";
import { infer } from "@/lib/v17/reasoning/inference";
import type { ReasoningPipelinePayload } from "@/lib/v17/reasoning/types";

export type ReasoningPipelineResult = {
  status: "ok";
  pipeline: ReasoningPipelinePayload;
};

/** V17 mixed reasoning edge — extract → evaluate → compare → infer. */
export default async function reasoningEdge(input = ""): Promise<ReasoningPipelineResult> {
  const extracted = await extract(input);
  const evaluated = await evaluate(extracted);
  const compared = await compare(evaluated, extracted);
  const inferred = await infer(compared, evaluated, extracted);

  return {
    status: "ok",
    pipeline: {
      extracted,
      evaluated,
      compared,
      inferred,
    },
  };
}
