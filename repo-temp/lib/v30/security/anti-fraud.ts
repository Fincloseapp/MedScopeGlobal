import { createServiceRoleClient } from "@/lib/supabase/service";
import { writeAuditLog } from "@/lib/v30/security/audit-log";
import { memoryRateLimit } from "@/lib/v30/security/rate-limit";

const CHECKOUT_BURST_LIMIT = 5;
const CHECKOUT_WINDOW_MS = 120_000;

export type FraudCheckResult = {
  allowed: boolean;
  reason?: string;
  attemptCount?: number;
};

/** Block rapid repeated Stripe checkout attempts from same IP. */
export async function checkCheckoutFraud(
  ip: string,
  stripeSessionId?: string | null
): Promise<FraudCheckResult> {
  const burst = memoryRateLimit(`v30:fraud:checkout:${ip}`, CHECKOUT_BURST_LIMIT, CHECKOUT_WINDOW_MS);
  if (!burst.ok) {
    await writeAuditLog({
      type: "anti_fraud:checkout_burst",
      ip,
      endpoint: "/api/stripe/checkout",
      severity: "warning",
      details: { retryAfter: burst.retryAfter },
    });
    return { allowed: false, reason: "too_many_checkout_attempts", attemptCount: CHECKOUT_BURST_LIMIT };
  }

  try {
    const admin = createServiceRoleClient();
    await admin.from("payment_attempts").insert({
      ip,
      stripe_session_id: stripeSessionId ?? null,
      status: "initiated",
      created_at: new Date().toISOString(),
    });
  } catch {
    /* table may not exist yet — in-memory limit still applies */
  }

  return { allowed: true, attemptCount: CHECKOUT_BURST_LIMIT - burst.remaining };
}

export async function recordPaymentAttempt(
  ip: string,
  stripeSessionId: string | null,
  status: string
): Promise<void> {
  try {
    const admin = createServiceRoleClient();
    await admin.from("payment_attempts").insert({
      ip,
      stripe_session_id: stripeSessionId,
      status,
      created_at: new Date().toISOString(),
    });
  } catch {
    /* ignore */
  }
}
