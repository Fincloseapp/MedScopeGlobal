import {
  createStripeClient,
  getStripeSecretKey,
  stripeClientErrorBody,
} from "@/lib/stripe/client";

const ZERO_DECIMAL = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

export type StripeBalanceLine = {
  amount: number;
  currency: string;
};

export type StripePayoutLine = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrivalDate: string | null;
};

export type StripeMoneySnapshot = {
  configured: boolean;
  available: StripeBalanceLine[];
  pending: StripeBalanceLine[];
  instantAvailable: StripeBalanceLine[];
  payoutsEnabled: boolean | null;
  payoutSchedule: string | null;
  recentPayouts: StripePayoutLine[];
  error?: string;
};

export const EMPTY_STRIPE_MONEY: StripeMoneySnapshot = {
  configured: false,
  available: [],
  pending: [],
  instantAvailable: [],
  payoutsEnabled: null,
  payoutSchedule: null,
  recentPayouts: [],
};

export function formatStripeMinor(amount: number, currency: string): string {
  const code = currency.toLowerCase();
  const value = ZERO_DECIMAL.has(code) ? amount : amount / 100;
  return `${value.toLocaleString("cs-CZ", {
    minimumFractionDigits: ZERO_DECIMAL.has(code) ? 0 : 2,
    maximumFractionDigits: 2,
  })} ${code.toUpperCase()}`;
}

function mapBalance(rows: { amount: number; currency: string }[]): StripeBalanceLine[] {
  return rows.map((row) => ({ amount: row.amount, currency: row.currency }));
}

const STRIPE_SNAPSHOT_MS = 4_000;

async function withTimeout<T>(run: Promise<T>, fallback: T, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      run,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallback), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function loadStripeMoneySnapshotUnsafe(): Promise<StripeMoneySnapshot> {
  try {
    const stripe = createStripeClient();
    const [balance, payouts, account] = await Promise.all([
      stripe.balance.retrieve(),
      stripe.payouts.list({ limit: 8 }),
      stripe.accounts.retrieve().catch(() => null),
    ]);
    const schedule = account?.settings?.payouts?.schedule;
    const scheduleLabel = schedule
      ? `${schedule.interval ?? "unknown"}${schedule.delay_days != null ? ` · ${schedule.delay_days} dní` : ""}`
      : null;
    return {
      configured: true,
      available: mapBalance(balance.available),
      pending: mapBalance(balance.pending),
      instantAvailable: mapBalance(balance.instant_available ?? []),
      payoutsEnabled: account?.payouts_enabled ?? null,
      payoutSchedule: scheduleLabel,
      recentPayouts: payouts.data.map((row) => ({
        id: row.id,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        arrivalDate: row.arrival_date
          ? new Date(row.arrival_date * 1000).toISOString()
          : null,
      })),
    };
  } catch (error) {
    return {
      configured: true,
      available: [],
      pending: [],
      instantAvailable: [],
      payoutsEnabled: null,
      payoutSchedule: null,
      recentPayouts: [],
      error: stripeClientErrorBody(error).error,
    };
  }
}

export async function loadStripeMoneySnapshot(): Promise<StripeMoneySnapshot> {
  if (!getStripeSecretKey()) {
    return { ...EMPTY_STRIPE_MONEY };
  }
  return withTimeout(
    loadStripeMoneySnapshotUnsafe(),
    {
      ...EMPTY_STRIPE_MONEY,
      configured: true,
      error: "Stripe timeout",
    },
    STRIPE_SNAPSHOT_MS
  );
}
