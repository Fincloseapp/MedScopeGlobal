import { createServiceRoleClient } from "@/lib/supabase/service";
import type { EmailCategory, EmailProvider, EmailSendStatus } from "@/lib/email/types";
import { logAdminEvent } from "@/lib/logging";

export interface EmailLogRow {
  id?: string;
  sent_at: string;
  email_type: EmailCategory;
  recipient: string;
  subject: string;
  status: EmailSendStatus;
  response_code: number | null;
  provider: EmailProvider;
  fallback_used: boolean;
  message_id: string | null;
  error: string | null;
  metadata: Record<string, unknown>;
}

export async function persistEmailLog(row: EmailLogRow): Promise<void> {
  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.from("email_logs").insert({
      sent_at: row.sent_at,
      email_type: row.email_type,
      recipient: row.recipient,
      subject: row.subject,
      status: row.status,
      response_code: row.response_code,
      provider: row.provider,
      fallback_used: row.fallback_used,
      message_id: row.message_id,
      error: row.error,
      metadata: row.metadata,
    });
    if (error) {
      await logAdminEvent("email_log_persist_failed", { error: error.message, row });
    }
  } catch (e) {
    await logAdminEvent("email_log_persist_failed", { error: (e as Error).message, row });
  }
}

export async function listEmailLogs(limit = 100): Promise<EmailLogRow[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("email_logs")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("listEmailLogs", error.message);
    return [];
  }
  return (data ?? []) as EmailLogRow[];
}

export async function getEmailLog(id: string): Promise<EmailLogRow | null> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin.from("email_logs").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data as EmailLogRow;
}
