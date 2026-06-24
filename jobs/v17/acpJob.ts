import acpEdge from "@/edge/v17/acp-edge";
import type { AcpRequest, AcpResult } from "@/lib/v17/acp/types";

/** V17 ACP job — runs full autonomous clinical pipeline. */
export default async function acpJob(request: AcpRequest = {}): Promise<AcpResult> {
  return acpEdge(request);
}
