import { parseGuidelineQuery } from "@/lib/v17/guideline/parser";

export type GuidelinePipelineResult = ReturnType<typeof parseGuidelineQuery>;

/** V17 guideline edge — structured query parse (skeleton). */
export default async function guidelineEdge(input = ""): Promise<GuidelinePipelineResult> {
  return parseGuidelineQuery(input);
}
