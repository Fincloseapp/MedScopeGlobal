import { createServiceRoleClient } from "@/lib/supabase/service";

export type AuditSeverity = "info" | "warning" | "critical";

export type AuditLogEntry = {
  type: string;
  ip?: string | null;
  userId?: string | null;
  endpoint?: string | null;
  details?: Record<string, unknown>;
  severity?: AuditSeverity;
};

/** Write to security_audit_logs (v30) with fallback to security_logs. */
export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  const row = {
    type: entry.type,
    ip: entry.ip ?? null,
    user_id: entry.userId ?? null,
    endpoint: entry.endpoint ?? null,
    details: entry.details ?? {},
    severity: entry.severity ?? "info",
    created_at: new Date().toISOString(),
  };

  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.from("security_audit_logs").insert(row);
    if (!error) return;

    await admin.from("security_logs").insert({
      ip: row.ip,
      user_id: row.user_id,
      action: `v30:${entry.type}`,
      status: entry.severity === "critical" ? "error" : entry.severity === "warning" ? "warning" : "ok",
      details: { endpoint: row.endpoint, ...row.details },
    });
  } catch (e) {
    console.error("writeAuditLog failed", entry.type, e);
  }
}

export async function listRecentAuditLogs(limit = 50) {
  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("security_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}
