import { runAcpPipeline } from "@/lib/v17/acp/orchestrator";
import type { AcpRequest, AcpResult } from "@/lib/v17/acp/types";

/** V17 ACP edge — autonomous clinical pipeline orchestration. */
export default async function acpEdge(request: AcpRequest = {}): Promise<AcpResult> {
  return runAcpPipeline(request);
}
