import Stripe from "stripe";

/** Wall-clock cap for Stripe HTTP calls on Cloudflare Workers (avoids ~240s hangs). */
export const STRIPE_REQUEST_TIMEOUT_MS = 20_000;

export function getStripeSecretKey(): string | null {
  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  return secret || null;
}

const CONNECT_ACCOUNT_RE = /^acct_[A-Za-z0-9]+$/;

/**
 * Stripe Connect destination for donations/tips.
 * Prefer `STRIPE_ACCOUNT_ID`, then `STRIPE_CONNECTED_ACCOUNT`.
 * Production value lives in wrangler vars / `.env.local` (not hardcoded here).
 */
export function getStripeConnectedAccountId(): string | null {
  const id =
    process.env.STRIPE_ACCOUNT_ID?.trim() ||
    process.env.STRIPE_CONNECTED_ACCOUNT?.trim() ||
    "";
  return CONNECT_ACCOUNT_RE.test(id) ? id : null;
}

/**
 * Stripe client for Node + Cloudflare Workers (OpenNext).
 * Default Node HTTP client can hang until outer timeouts on Workers;
 * fetch is the supported edge path.
 */
export function createStripeClient(secret?: string): Stripe {
  const key = (secret ?? getStripeSecretKey())?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY missing");
  }

  return new Stripe(key, {
    httpClient: Stripe.createFetchHttpClient(),
    timeout: STRIPE_REQUEST_TIMEOUT_MS,
    maxNetworkRetries: 1,
  });
}

/** SubtleCrypto provider for webhook signature verification on Workers. */
export function stripeWebhookCryptoProvider(): Stripe.CryptoProvider {
  return Stripe.createSubtleCryptoProvider();
}

export type StripeClientErrorBody = {
  error: string;
  enabled: boolean;
  detail: string;
  code?: string;
  type?: string;
};

/** Map Stripe / network failures to an actionable JSON body for operators and UI. */
export function stripeClientErrorBody(err: unknown): StripeClientErrorBody {
  const message = err instanceof Error ? err.message : String(err ?? "unknown");
  const stripeErr = err as {
    type?: string;
    code?: string;
    raw?: { message?: string; code?: string; type?: string };
  };

  const detail =
    (typeof stripeErr?.raw?.message === "string" && stripeErr.raw.message) ||
    message;

  const code = stripeErr?.code || stripeErr?.raw?.code;
  const type = stripeErr?.type || stripeErr?.raw?.type;

  const isConfig =
    /invalid api key|no such api key|authentication|api_key|expired.*key/i.test(detail) ||
    code === "api_key_expired" ||
    type === "StripeAuthenticationError";

  const isTimeout =
    /timeout|timed out|AbortError|network.*fail|fetch failed|ECONNRESET|ETIMEDOUT/i.test(
      detail
    );

  let error: string;
  if (isConfig) {
    error =
      "Stripe klíč je neplatný nebo neúplný — zkontrolujte STRIPE_SECRET_KEY na Workeru";
  } else if (isTimeout) {
    error =
      "Stripe neodpověděl včas (Workers timeout) — zkuste znovu nebo zkontrolujte odchozí spojení k api.stripe.com";
  } else {
    // Prefer Stripe's own message so broken amounts/currency/restricted keys are actionable.
    error = detail.slice(0, 280) || "Chyba při vytváření platby";
  }

  return {
    error,
    enabled: !isConfig,
    detail: detail.slice(0, 500),
    ...(code ? { code } : {}),
    ...(type ? { type } : {}),
  };
}
