import { logAdminEvent } from "@/lib/logging";
import { persistEmailLog } from "@/lib/email/log";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";

export type DeliverabilityEventType =
  | "bounce"
  | "spam_report"
  | "open"
  | "click"
  | "delivered"
  | "dropped"
  | "deferred"
  | "unknown";

export interface DeliverabilityEvent {
  type: DeliverabilityEventType;
  email: string;
  messageId?: string;
  timestamp: string;
  reason?: string;
  url?: string;
  raw?: Record<string, unknown>;
}

/** Map SendGrid Event Webhook payload to normalized events. */
export function parseSendGridEvents(body: unknown): DeliverabilityEvent[] {
  if (!Array.isArray(body)) return [];
  return body.map((item) => {
    const row = item as Record<string, unknown>;
    const event = String(row.event ?? "unknown");
    const typeMap: Record<string, DeliverabilityEventType> = {
      bounce: "bounce",
      dropped: "dropped",
      spamreport: "spam_report",
      open: "open",
      click: "click",
      delivered: "delivered",
      deferred: "deferred",
    };
    return {
      type: typeMap[event] ?? "unknown",
      email: String(row.email ?? ""),
      messageId: row.sg_message_id ? String(row.sg_message_id) : undefined,
      timestamp: row.timestamp
        ? new Date(Number(row.timestamp) * 1000).toISOString()
        : new Date().toISOString(),
      reason: row.reason ? String(row.reason) : undefined,
      url: row.url ? String(row.url) : undefined,
      raw: row,
    };
  });
}

export async function recordDeliverabilityEvents(events: DeliverabilityEvent[]): Promise<void> {
  for (const ev of events) {
    await logAdminEvent("email_deliverability", {
      type: ev.type,
      email: ev.email,
      messageId: ev.messageId,
      timestamp: ev.timestamp,
      reason: ev.reason,
      url: ev.url,
      webhookReady: true,
    });
    await persistEmailLog({
      sent_at: ev.timestamp,
      email_type: "system",
      recipient: ev.email || "unknown",
      subject: `deliverability:${ev.type}`,
      status: ev.type === "bounce" || ev.type === "dropped" ? "failed" : "sent",
      response_code: null,
      provider: "sendgrid",
      fallback_used: false,
      message_id: ev.messageId ?? null,
      error: ev.reason ?? null,
      metadata: {
        deliverability: ev.type,
        url: ev.url,
        raw: ev.raw,
      },
    });
    console.info("[email-monitor]", ev.type, ev.email, ev.messageId ?? "");
  }
}

/** Metrics for admin dashboards — aggregated from email_logs webhook events. */
export async function getDeliverabilitySummary(): Promise<{
  bounces: number;
  spamReports: number;
  opens: number;
  clicks: number;
  note: string;
}> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) {
    return {
      bounces: 0,
      spamReports: 0,
      opens: 0,
      clicks: 0,
      note: "Service role unavailable — connect SendGrid Event Webhook to /api/email/webhook/sendgrid",
    };
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await admin
    .from("email_logs")
    .select("metadata")
    .eq("email_type", "system")
    .like("subject", "deliverability:%")
    .gte("sent_at", since)
    .limit(2000);

  if (error || !data) {
    return {
      bounces: 0,
      spamReports: 0,
      opens: 0,
      clicks: 0,
      note: "No deliverability rows yet — connect SendGrid Event Webhook to /api/email/webhook/sendgrid",
    };
  }

  let bounces = 0;
  let spamReports = 0;
  let opens = 0;
  let clicks = 0;
  for (const row of data) {
    const t = String((row.metadata as Record<string, unknown> | null)?.deliverability ?? "");
    if (t === "bounce" || t === "dropped") bounces += 1;
    else if (t === "spam_report") spamReports += 1;
    else if (t === "open") opens += 1;
    else if (t === "click") clicks += 1;
  }

  return {
    bounces,
    spamReports,
    opens,
    clicks,
    note: "Last 30 days from SendGrid webhook → email_logs",
  };
}
