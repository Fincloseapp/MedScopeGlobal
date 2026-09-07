import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { createStripeClient, getStripeSecretKey } from "@/lib/stripe/client";
import { normalizeV27OrderStatus } from "@/lib/monetization/order-statuses";

export type ReconcileResult = {
  ok: boolean;
  scanned: number;
  markedPaid: number;
  markedExpired: number;
  markedCanceled: number;
  payoutsCreated: number;
  notes: string[];
  errors: string[];
};

const MIN_PAYOUT_MINOR: Record<string, number> = {
  czk: 10_000,
  eur: 100,
  usd: 100,
  gbp: 100,
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function reconcileV27Orders(limit = 40): Promise<{
  scanned: number;
  markedPaid: number;
  markedExpired: number;
  markedCanceled: number;
  errors: string[];
}> {
  const empty = {
    scanned: 0,
    markedPaid: 0,
    markedExpired: 0,
    markedCanceled: 0,
    errors: [] as string[],
  };
  if (!getStripeSecretKey()) {
    return { ...empty, errors: ["stripe_not_configured"] };
  }
  const admin = tryCreateServiceRoleClient();
  if (!admin) return { ...empty, errors: ["no_service_role"] };

  const { data, error } = await admin
    .from("v27_orders")
    .select("id, stripe_session_id, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) return { ...empty, errors: [error.message] };

  const stripe = createStripeClient();
  let markedPaid = 0;
  let markedExpired = 0;
  let markedCanceled = 0;
  const errors: string[] = [];

  for (const row of data ?? []) {
    const sessionId = String(row.stripe_session_id ?? "");
    if (!sessionId.startsWith("cs_")) continue;
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const paid =
        session.payment_status === "paid" || session.status === "complete";
      const expired = session.status === "expired";
      const nowStatus = paid
        ? "paid"
        : expired
          ? "expired"
          : session.status === "open"
            ? "pending"
            : normalizeV27OrderStatus(session.status);

      if (nowStatus === "pending") continue;

      const patch: Record<string, unknown> = {
        status: nowStatus,
        updated_at: new Date().toISOString(),
      };
      if (paid && session.payment_intent) {
        patch.stripe_payment_intent_id = String(session.payment_intent);
      }
      const { error: updateError } = await admin
        .from("v27_orders")
        .update(patch)
        .eq("id", row.id)
        .eq("status", "pending");
      if (updateError) {
        errors.push(updateError.message);
        continue;
      }
      if (nowStatus === "paid") markedPaid += 1;
      else if (nowStatus === "expired") markedExpired += 1;
      else if (nowStatus === "canceled") markedCanceled += 1;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "session retrieve failed");
    }
  }

  return {
    scanned: (data ?? []).length,
    markedPaid,
    markedExpired,
    markedCanceled,
    errors,
  };
}

export async function payoutAvailableBalance(): Promise<{
  created: number;
  notes: string[];
  errors: string[];
}> {
  const notes: string[] = [];
  const errors: string[] = [];
  if (!getStripeSecretKey()) {
    return { created: 0, notes: ["stripe_not_configured"], errors: [] };
  }
  const stripe = createStripeClient();
  try {
    const [balance, account, openPayouts] = await Promise.all([
      stripe.balance.retrieve(),
      stripe.accounts.retrieve().catch(() => null),
      stripe.payouts.list({ status: "pending", limit: 5 }).catch(() => ({ data: [] })),
    ]);

    if (account && account.payouts_enabled === false) {
      notes.push("Stripe výplaty nejsou zapnuté — doplňte bankovní účet v Dashboardu.");
      return { created: 0, notes, errors };
    }

    const interval = account?.settings?.payouts?.schedule?.interval ?? "daily";
    if (interval !== "manual") {
      notes.push(
        `Stripe vyplácí automaticky (${interval}). Pending se přesune samo; ruční výplatu nespouštím.`
      );
      return { created: 0, notes, errors };
    }

    if (openPayouts.data.length > 0) {
      notes.push("Už běží pending výplata — další nevytvářím.");
      return { created: 0, notes, errors };
    }

    let created = 0;
    for (const row of balance.available) {
      const min = MIN_PAYOUT_MINOR[row.currency] ?? 100;
      if (row.amount < min) {
        if (row.amount > 0) {
          notes.push(
            `${row.currency.toUpperCase()} ${row.amount} je pod minimem výplaty.`
          );
        }
        continue;
      }
      try {
        await stripe.payouts.create(
          {
            amount: row.amount,
            currency: row.currency,
            statement_descriptor: "ViaLongeVita",
          },
          { idempotencyKey: `vlv-auto-${row.currency}-${todayKey()}` }
        );
        created += 1;
        notes.push(`Výplata ${row.currency.toUpperCase()} odeslána.`);
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "payout failed");
      }
    }
    if (created === 0 && notes.length === 0) {
      notes.push("Available zůstatek je 0 — není co vyplácet.");
    }
    return { created, notes, errors };
  } catch (err) {
    return {
      created: 0,
      notes,
      errors: [err instanceof Error ? err.message : "payout lookup failed"],
    };
  }
}

export async function runRevenueReconcile(): Promise<ReconcileResult> {
  const orders = await reconcileV27Orders();
  const payouts = await payoutAvailableBalance();
  return {
    ok: orders.errors.length === 0 && payouts.errors.length === 0,
    scanned: orders.scanned,
    markedPaid: orders.markedPaid,
    markedExpired: orders.markedExpired,
    markedCanceled: orders.markedCanceled,
    payoutsCreated: payouts.created,
    notes: payouts.notes,
    errors: [...orders.errors, ...payouts.errors],
  };
}
