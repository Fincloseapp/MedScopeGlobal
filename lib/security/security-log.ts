import { createServiceRoleClient } from "@/lib/supabase/service";

export type SecurityLogStatus = "ok" | "blocked" | "warning" | "error";

export async function logSecurityEvent(params: {
  ip?: string | null;
  userId?: string | null;
  action: string;
  status: SecurityLogStatus;
  details?: Record<string, unknown>;
}) {
  try {
    const admin = createServiceRoleClient();
    await admin.from("security_logs").insert({
      ip: params.ip ?? null,
      user_id: params.userId ?? null,
      action: params.action,
      status: params.status,
      details: params.details ?? {},
    });
  } catch (e) {
    console.error("logSecurityEvent failed", params.action, e);
  }
}
