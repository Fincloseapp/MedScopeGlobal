import clinicalEdge from "@/edge/v17/clinical-edge";

/** V17 clinical job — skeleton (no logic yet). */
export default async function clinicalJob(): Promise<void> {
  await clinicalEdge();
}
