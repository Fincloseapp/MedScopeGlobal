import { logAdminEvent } from "@/lib/logging";

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
      stub: true,
      webhookReady: true,
    });
    console.info("[email-monitor]", ev.type, ev.email, ev.messageId ?? "");
  }
}

/** Stub metrics for admin dashboards — populated via webhooks later. */
export async function getDeliverabilitySummary(): Promise<{
  bounces: number;
  spamReports: number;
  opens: number;
  clicks: number;
  note: string;
}> {
  return {
    bounces: 0,
    spamReports: 0,
    opens: 0,
    clicks: 0,
    note: "Webhook-ready stubs — connect SendGrid Event Webhook to /api/email/webhook/sendgrid",
  };
}
