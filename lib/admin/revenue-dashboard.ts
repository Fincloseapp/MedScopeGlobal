import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import { loadStripeMoneySnapshot, type StripeMoneySnapshot } from "@/lib/admin/stripe-snapshot";
import { loadAiAgentGrowthSnapshot, type AiAgentGrowthSnapshot } from "@/lib/growth/ai-agent-stats";
import {
  explainV27OrderStatus,
  youWillReceiveLines,
  type OrderStatusExplain,
} from "@/lib/monetization/order-statuses";
import type { LegalSprintResult } from "@/lib/growth/legal-sprint";

export type RevenueOrderRow = {
  id: string;
  productId: string;
  kind: string;
  amountCzk: number;
  status: string;
  explain: OrderStatusExplain;
  createdAt: string;
};

export type RevenueDashboard = {
  loadedAt: string;
  stripe: StripeMoneySnapshot;
  youWillReceive: { amount: number; currency: string }[];
  growth: AiAgentGrowthSnapshot;
  counts: {
    paid: number;
    pending: number;
    expired: number;
    other: number;
    paidCzk: number;
    pendingCzk: number;
  };
  recent: RevenueOrderRow[];
  adsApproved: number;
  sprint: LegalSprintResult | null;
};

async function countEq(
  table: string,
  column: string,
  value: string
): Promise<number> {
  const admin = tryCreateServiceRoleClient();
  if (!admin) return 0;
  try {
    const { count, error } = await admin
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq(column, value);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function loadRevenueDashboard(
  sprint: LegalSprintResult | null
): Promise<RevenueDashboard> {
  const admin = tryCreateServiceRoleClient();
  const [stripe, growth, paid, pending, expired, adsApproved] = await Promise.all([
    loadStripeMoneySnapshot(),
    loadAiAgentGrowthSnapshot(),
    countEq("v27_orders", "status", "paid"),
    countEq("v27_orders", "status", "pending"),
    countEq("v27_orders", "status", "expired"),
    countEq("ads_requests", "status", "approved"),
  ]);

  const completed = await countEq("v27_orders", "status", "completed");
  const paidCount = paid + completed;

  let paidCzk = 0;
  let pendingCzk = 0;
  let recent: RevenueOrderRow[] = [];
  let other = 0;

  if (admin) {
    try {
      const { data: moneyRows } = await admin
        .from("v27_orders")
        .select("amount_czk, status")
        .in("status", ["paid", "completed", "pending"])
        .limit(4000);
      for (const row of moneyRows ?? []) {
        const amount = Number(row.amount_czk ?? 0);
        if (row.status === "pending") pendingCzk += amount;
        else paidCzk += amount;
      }
    } catch {
      /* table may be missing */
    }

    try {
      const { count } = await admin.from("v27_orders").select("id", { count: "exact", head: true });
      other = Math.max(0, (count ?? 0) - paidCount - pending - expired);
    } catch {
      other = 0;
    }

    try {
      const { data } = await admin
        .from("v27_orders")
        .select("id, product_id, kind, amount_czk, status, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      recent = (data ?? []).map((row) => ({
        id: String(row.id),
        productId: String(row.product_id ?? "—"),
        kind: String(row.kind ?? "—"),
        amountCzk: Number(row.amount_czk ?? 0),
        status: String(row.status ?? "pending"),
        explain: explainV27OrderStatus(String(row.status ?? "pending")),
        createdAt: String(row.created_at ?? ""),
      }));
    } catch {
      recent = [];
    }
  }

  const inTransit = stripe.recentPayouts
    .filter((row) => row.status === "pending" || row.status === "in_transit")
    .map((row) => ({ amount: row.amount, currency: row.currency }));

  return {
    loadedAt: new Date().toISOString(),
    stripe,
    youWillReceive: youWillReceiveLines({
      available: stripe.available,
      pending: stripe.pending,
      inTransit,
    }),
    growth,
    counts: {
      paid: paidCount,
      pending,
      expired,
      other,
      paidCzk,
      pendingCzk,
    },
    recent,
    adsApproved,
    sprint,
  };
}
