/**
 * AI Engine v18 — audit logging to Supabase v17_audit_logs.
 */
import { createServiceRoleClient } from "@/lib/supabase/service";

export type AiAuditParams = {
  userId?: string | null;
  model: string;
  inputLength: number;
  outputLength: number;
  risk: string;
  endpoint: string;
  requestId?: string;
  blocked?: boolean;
  issues?: string[];
};

export async function writeAiAuditLog(params: AiAuditParams): Promise<boolean> {
  const requestId =
    params.requestId ?? `v18-${params.endpoint}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.from("v17_audit_logs").insert({
      request_id: requestId,
      job_slug: `v18:${params.endpoint}`,
      nodes_used: [],
      edges_used: [],
      edge_scores: [],
      inference_chain: [],
      constants: {
        engine: "v18",
        userId: params.userId ?? null,
        model: params.model,
        inputLength: params.inputLength,
        outputLength: params.outputLength,
        risk: params.risk,
        endpoint: params.endpoint,
        blocked: params.blocked ?? false,
        issues: params.issues ?? [],
      },
      version: "V18.0.0",
    });

    if (error) {
      console.error("[v18 audit]", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      "[v18 audit]",
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}
