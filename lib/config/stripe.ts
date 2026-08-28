/**
 * MedScopeGlobal Stripe merchant account (Dashboard → Settings → Account details).
 * Secret/publishable keys must belong to this account — never commit live keys.
 */
export const STRIPE_ACCOUNT_ID = "acct_1TiWEIBEAzp5LarK" as const;

export const STRIPE_WEBHOOK_URL = "https://medscopeglobal.com/api/stripe/webhook" as const;
export const STRIPE_WEBHOOK_URL_WWW = "https://www.medscopeglobal.com/api/stripe/webhook" as const;

/** Env override for Connect / multi-account setups; defaults to MedScope merchant. */
export function getConfiguredStripeAccountId(): string {
  const fromEnv = process.env.STRIPE_ACCOUNT_ID?.trim();
  return fromEnv || STRIPE_ACCOUNT_ID;
}

export function isStripeSecretConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
}

export function isStripePublishableConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim());
}
