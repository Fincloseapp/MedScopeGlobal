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

export type StripeMoneySnapshot = {
  configured: boolean;
  available: StripeBalanceLine[];
  pending: StripeBalanceLine[];
  error?: string;
};

export function formatStripeMinor(amount: number, currency: string): string {
  const code = currency.toLowerCase();
  const value = ZERO_DECIMAL.has(code) ? amount : amount / 100;
  return `${value.toLocaleString("cs-CZ", {
    minimumFractionDigits: ZERO_DECIMAL.has(code) ? 0 : 2,
    maximumFractionDigits: 2,
  })} ${code.toUpperCase()}`;
}

export async function loadStripeMoneySnapshot(): Promise<StripeMoneySnapshot> {
  if (!getStripeSecretKey()) {
    return { configured: false, available: [], pending: [] };
  }
  try {
    const stripe = createStripeClient();
    const balance = await stripe.balance.retrieve();
    return {
      configured: true,
      available: balance.available.map((row) => ({
        amount: row.amount,
        currency: row.currency,
      })),
      pending: balance.pending.map((row) => ({
        amount: row.amount,
        currency: row.currency,
      })),
    };
  } catch (error) {
    return {
      configured: true,
      available: [],
      pending: [],
      error: stripeClientErrorBody(error).error,
    };
  }
}
