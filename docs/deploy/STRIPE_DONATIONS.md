# Stripe donations — Worker secrets checklist

Live donations use Stripe Checkout via `POST /api/ecosystem/donate` (and tip/checkout routes).

**Root cause of production hang (2026-08-27):** `secretKeyConfigured: true` but `POST /api/ecosystem/donate` returned `503` `{"error":"Chyba při vytváření platby"}` after **~242s**. The Stripe Node default HTTP client stalls on Cloudflare Workers.

**Canonical Workers-safe path on `main`:** donate/tip create Checkout with pure-fetch `lib/stripe/checkout-fetch.ts` (`createCheckoutSession`, 12s `AbortSignal`). Shared `lib/stripe/client.ts` (`createStripeClient` + `Stripe.createFetchHttpClient()`, 20s) still backs ads/academy/webhook and secret-key helpers. Smoke: `scripts/smoke-stripe-checkout-fetch.ts`.

Canonical site: `https://medscopeglobal.com`

---

## Checkout vs webhook (read this first)

| Capability | Needs `STRIPE_SECRET_KEY` | Needs `STRIPE_WEBHOOK_SECRET` |
|------------|---------------------------|------------------------------|
| Create Checkout session (`POST /api/ecosystem/donate`, article tip) | **Yes** | **No** |
| Redirect payer to `checkout.stripe.com` and collect payment | **Yes** | **No** |
| Post-payment fulfillment / order logging via `/api/stripe/webhook` | — | **Yes** (when you want server-side confirmation) |

**Webhook is optional until fulfillment is required.** Skipping `STRIPE_WEBHOOK_SECRET` in Cursor Secrets / local `.env.local` does **not** block Checkout. Payments still complete in Stripe Checkout; without the webhook you only lose automatic post-payment fulfillment and webhook-driven logging until you add `whsec_…` later.

---

## Required Worker secrets / vars

Cloudflare Dashboard → **Workers & Pages** → **medscopeglobal** → **Settings** → **Variables and Secrets**

| Name | Type | Notes |
|------|------|--------|
| `STRIPE_SECRET_KEY` | Secret | Live secret key (`sk_live_…`). **Required** for Checkout session creation. |
| `STRIPE_WEBHOOK_SECRET` | Secret | Endpoint signing secret (`whsec_…`). **Optional until fulfillment required** — Checkout redirect works without it. Only needed for `/api/stripe/webhook` verification + post-payment fulfillment/logging. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Variable (or Secret) | Live publishable key (`pk_live_…`). Used by client Checkout / Elements. |

Also keep `NEXT_PUBLIC_SITE_URL=https://medscopeglobal.com` so success/cancel URLs resolve correctly.

Optional bulk sync from PC: `pnpm cf:env:sync` — then paste into dashboard or use `CLOUDFLARE_ENV_JSON` in GitHub Actions.

---

## Webhook endpoint (optional until fulfillment)

| Field | Value |
|-------|--------|
| URL | `https://medscopeglobal.com/api/stripe/webhook` |
| Events (minimum) | `checkout.session.completed`, `customer.subscription.*`, `invoice.paid` / `invoice.payment_failed` |

```powershell
cd D:\medscope.local
node scripts/setup-stripe-webhook.mjs
```

Copy signing secret into Worker `STRIPE_WEBHOOK_SECRET`. Prefer the apex host above (www also reaches the Worker if DNS redirects).

### Set via wrangler (do not log the value)

```bash
# From a shell where STRIPE_WEBHOOK_SECRET is already in the environment:
printf '%s' "$STRIPE_WEBHOOK_SECRET" | npx wrangler secret put STRIPE_WEBHOOK_SECRET --name medscopeglobal
```

Classic `secret put` **requires the latest uploaded Worker version to already be the live deployment**. If wrangler errors with *“the latest version of your Worker isn't currently deployed”*:

1. **Preferred:** run a healthy `pnpm cf:deploy` (so latest == live), then re-run classic `secret put` above.
2. **Versioned alternative** (creates a new version; you must deploy it explicitly):

```bash
printf '%s' "$STRIPE_WEBHOOK_SECRET" | npx wrangler versions secret put STRIPE_WEBHOOK_SECRET \
  --name medscopeglobal \
  --message "Add STRIPE_WEBHOOK_SECRET for checkout fulfillment"
# Note the printed version id, then:
npx wrangler versions deploy '<NEW_VERSION_ID>@100' --name medscopeglobal --yes
```

**Caveat (2026-08-27):** `versions secret put` always clones the **latest upload**, not the currently live version. If an undeployed/bad upload is newest (e.g. a rolled-back build), deploying that secret version will 500 production. Confirm latest is known-good before `versions deploy`, or use option 1.

Verify (no secret value printed):

```bash
npx wrangler secret list --name medscopeglobal | rg STRIPE_WEBHOOK
curl -sS https://medscopeglobal.com/api/v29/health | jq '.stripe.webhookSecretConfigured'
# Expect true after the secret is on the live version
```

---

## Health & smoke

```bash
curl -sS https://medscopeglobal.com/api/v29/health | jq '.stripe'
# Expect: secretKeyConfigured=true, httpClient=fetch after Workers-safe deploy
# webhookSecretConfigured may be false — OK until you need post-payment fulfillment

curl -sS -X POST https://medscopeglobal.com/api/ecosystem/donate \
  -H 'content-type: application/json' \
  -d '{"amount":2000,"currency":"czk"}'
# Expect (<5s): {"url":"https://checkout.stripe.com/...","sessionId":"cs_..."}
# Or actionable JSON with error + detail (not a 4-minute hang)

curl -sI https://medscopeglobal.com/assets/marketing/mediflow.webp
# Expect: HTTP 200, content-type: image/webp
```

---

## Deploy blockers (cloud agent)

`pnpm cf:deploy` / GH Actions **Cloudflare Workers Deploy** need `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (Cursor Secrets or `.env.local`). Without them, Actions fails in ~10s and cloud `wrangler whoami` is unauthenticated.

Unblock from PC:

```powershell
cd D:\medscope.local
git checkout main
git pull origin main
pnpm auto:d          # restore CF/Stripe from D: → deploy → webhook reminder → donate/mediflow probe
# or cloud with Cursor Secrets: pnpm auto:continue
pnpm probe:prod:stripe
```

Dashboard fallback (no token): Workers Builds → **medscopeglobal** → Retry deployment of `main` — see [`CF_DASHBOARD_DEPLOY.md`](./CF_DASHBOARD_DEPLOY.md).

---

## Related

- [`QUICK_START_PC.md`](./QUICK_START_PC.md)
- [`RESTORE_FROM_D.md`](./RESTORE_FROM_D.md)
- [`production-runbook.md`](./production-runbook.md)
- [`CF_DASHBOARD_DEPLOY.md`](./CF_DASHBOARD_DEPLOY.md)
