# Stripe — MedScopeGlobal

Production is **Cloudflare Workers** (`medscopeglobal` → `https://medscopeglobal.com`). Not Vercel.

## Merchant account

| Field | Value |
|-------|--------|
| Account ID | `acct_1TO0PrDCziy2VdwH` |
| Constant | `lib/config/stripe.ts` → `STRIPE_ACCOUNT_ID` |
| Env | `STRIPE_ACCOUNT_ID` (optional override; default is the constant above) |

Checkout uses the platform secret key from **this** account. Do not point keys from another Stripe account at production.

## Secrets (never commit)

| Variable | Where |
|----------|--------|
| `STRIPE_SECRET_KEY` | `.env.local`, Worker secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `.env.local`, Worker env / secret |
| `STRIPE_WEBHOOK_SECRET` | `.env.local`, Worker secret (`whsec_…`) |

Set on Cloudflare: Worker `medscopeglobal` → Settings → Variables and Secrets.

Local:

```text
STRIPE_ACCOUNT_ID=acct_1TO0PrDCziy2VdwH
STRIPE_SECRET_KEY=sk_live_…          # from acct_1TO0PrDCziy2VdwH only
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_…
STRIPE_WEBHOOK_SECRET=whsec_…
```

## Webhook (Dashboard)

1. Open [Stripe Dashboard](https://dashboard.stripe.com) for **acct_1TO0PrDCziy2VdwH**
2. Developers → Webhooks → Add endpoint  
   URL: `https://medscopeglobal.com/api/stripe/webhook`  
   (www alias also works: `https://www.medscopeglobal.com/api/stripe/webhook`)
3. Events: `checkout.session.completed`, `invoice.paid`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy signing secret → Worker secret `STRIPE_WEBHOOK_SECRET`

Optional helper (uses `.env.local` key, does not print secrets):

```powershell
cd D:\MedScopeGlobal\marketing-hub-deploy
node scripts/setup-stripe-webhook.mjs
```

## Verify

```powershell
# Expect 400 (missing signature) when endpoint is live:
curl -X POST https://medscopeglobal.com/api/stripe/webhook

# Health (no secrets returned):
curl https://medscopeglobal.com/api/v29/health
```

Health JSON includes `stripe.accountId` = `acct_1TO0PrDCziy2VdwH` and booleans for whether keys are configured.
