import summarizationEdge from "@/edge/v17/summarization-edge";

/** V17 summarization job — skeleton (no logic yet). */
export default async function summarizationJob(): Promise<void> {
  await summarizationEdge();
}
