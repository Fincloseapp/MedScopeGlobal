# Stripe donations — Worker secrets checklist

Live donations use Stripe Checkout via `POST /api/ecosystem/donate` (and tip/checkout routes).

**Root cause of production hang (2026-08-27):** `secretKeyConfigured: true` but `POST /api/ecosystem/donate` returned `503` `{"error":"Chyba při vytváření platby"}` after **~242s**. The Stripe Node default HTTP client stalls on Cloudflare Workers.

**Canonical Workers-safe path on `main`:** `Stripe.createFetchHttpClient()` via `lib/stripe/client.ts` (`createStripeClient`, 20s timeout) for donate/tip/ads/academy/webhook. Alternate pure-fetch helper: `lib/stripe/checkout-fetch.ts` (12s `AbortSignal`) + `scripts/smoke-stripe-checkout-fetch.ts` — kept for tests, not used by production routes.

Canonical site: `https://medscopeglobal.com`

---

## Required Worker secrets / vars

Cloudflare Dashboard → **Workers & Pages** → **medscopeglobal** → **Settings** → **Variables and Secrets**

| Name | Type | Notes |
|------|------|--------|
| `STRIPE_SECRET_KEY` | Secret | Live secret key (`sk_live_…`). Required for Checkout session creation. |
| `STRIPE_WEBHOOK_SECRET` | Secret | Endpoint signing secret (`whsec_…`). Required for `/api/stripe/webhook` fulfillment (Checkout redirect works without it). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Variable (or Secret) | Live publishable key (`pk_live_…`). Used by client Checkout / Elements. |

Also keep `NEXT_PUBLIC_SITE_URL=https://medscopeglobal.com` so success/cancel URLs resolve correctly.

Optional bulk sync from PC: `pnpm cf:env:sync` — then paste into dashboard or use `CLOUDFLARE_ENV_JSON` in GitHub Actions.

---

## Webhook endpoint

| Field | Value |
|-------|--------|
| URL | `https://medscopeglobal.com/api/stripe/webhook` |
| Events (minimum) | `checkout.session.completed`, `customer.subscription.*`, `invoice.paid` / `invoice.payment_failed` |

```powershell
cd D:\medscope.local
node scripts/setup-stripe-webhook.mjs
```

Copy signing secret into Worker `STRIPE_WEBHOOK_SECRET`. Prefer the apex host above (www also reaches the Worker if DNS redirects).

---

## Health & smoke

```bash
curl -sS https://medscopeglobal.com/api/v29/health | jq '.stripe'
# Expect: secretKeyConfigured=true, httpClient=fetch after Workers-safe deploy
# webhookSecretConfigured should become true once whsec is set

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
