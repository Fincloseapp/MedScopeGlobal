import { createServiceRoleClient } from "@/lib/supabase/service";
import { logAdminEvent } from "@/lib/logging";

export interface StripeWebhookLogInput {
  eventId?: string;
  eventType: string;
  livemode?: boolean;
  apiVersion?: string;
  status: "received" | "processed" | "ignored" | "failed";
  objectId?: string;
  customerId?: string;
  error?: string;
  payload?: Record<string, unknown>;
}

export interface StripeWebhookLogRow {
  id?: string;
  received_at: string;
  event_id: string | null;
  event_type: string;
  livemode: boolean;
  api_version: string | null;
  status: StripeWebhookLogInput["status"];
  object_id: string | null;
  customer_id: string | null;
  error: string | null;
  payload: Record<string, unknown>;
}

export async function listStripeWebhookLogs(limit = 100): Promise<StripeWebhookLogRow[]> {
  const admin = createServiceRoleClient();
  const { data, error } = await admin
    .from("stripe_webhook_logs")
    .select("*")
    .order("received_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("listStripeWebhookLogs", error.message);
    return [];
  }
  return (data ?? []) as StripeWebhookLogRow[];
}

export async function persistStripeWebhookLog(input: StripeWebhookLogInput): Promise<void> {
  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.from("stripe_webhook_logs").insert({
      event_id: input.eventId ?? null,
      event_type: input.eventType,
      livemode: input.livemode ?? false,
      api_version: input.apiVersion ?? null,
      status: input.status,
      object_id: input.objectId ?? null,
      customer_id: input.customerId ?? null,
      error: input.error ?? null,
      payload: input.payload ?? {},
    });
    if (error) {
      await logAdminEvent("stripe_webhook_log_failed", { error: error.message, input });
    }
  } catch (e) {
    await logAdminEvent("stripe_webhook_log_failed", {
      error: (e as Error).message,
      input,
    });
  }
}
