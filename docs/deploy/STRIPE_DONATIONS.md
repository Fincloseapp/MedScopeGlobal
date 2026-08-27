# Stripe donations — Worker secrets checklist

Live donations use Stripe Checkout via `POST /api/ecosystem/donate` (and tip/checkout routes).

**Root cause of production hang (2026-08-27):** `secretKeyConfigured: true` but `POST /api/ecosystem/donate` returned `503` `{"error":"Chyba při vytváření platby"}` after **~242s**. The Stripe Node default HTTP client stalls on Cloudflare Workers; fix is `Stripe.createFetchHttpClient()` in `lib/stripe/client.ts` (20s timeout) + surface Stripe `detail` to the client.

Canonical site: `https://medscopeglobal.com`

---

## Required Worker secrets / vars

Cloudflare Dashboard → **Workers & Pages** → **medscopeglobal** → **Settings** → **Variables and Secrets**

| Name | Type | Notes |
|------|------|--------|
| `STRIPE_SECRET_KEY` | Secret | Live secret key (`sk_live_…`). Required for Checkout session creation. |
| `STRIPE_WEBHOOK_SECRET` | Secret | Endpoint signing secret (`whsec_…`). Required for `/api/stripe/webhook` fulfillment (Checkout redirect works without it). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Variable (or Secret) | Live publishable key (`pk_live_…`). |

Also keep `NEXT_PUBLIC_SITE_URL=https://medscopeglobal.com` so success/cancel URLs resolve correctly.

Optional bulk sync from PC: `pnpm cf:env:sync` — then paste into dashboard or use `CLOUDFLARE_ENV_JSON` in GitHub Actions.

---

## Webhook endpoint

| Field | Value |
|-------|--------|
| URL | `https://www.medscopeglobal.com/api/stripe/webhook` |
| Events (minimum) | `checkout.session.completed`, `customer.subscription.*`, `invoice.paid` / `invoice.payment_failed` |

```powershell
cd D:\medscope.local
node scripts/setup-stripe-webhook.mjs
```

Copy signing secret into Worker `STRIPE_WEBHOOK_SECRET`.

---

## Health & smoke

```bash
curl -sS https://medscopeglobal.com/api/v29/health | jq '.stripe'
# Expect: secretKeyConfigured=true, httpClient=fetch after this deploy
# webhookSecretConfigured should become true once whsec is set

curl -sS -X POST https://medscopeglobal.com/api/ecosystem/donate \
  -H 'content-type: application/json' \
  -d '{"amount":2000,"currency":"czk"}'
# Expect (<5s): {"url":"https://checkout.stripe.com/...","sessionId":"cs_..."}
# Or actionable JSON with error + detail (not a 4-minute hang)
```

---

## Deploy blockers (cloud agent)

`pnpm cf:deploy` needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`.

```powershell
cd D:\medscope.local
git checkout main && git pull
# merge cursor/fix-stripe-live-2b2d if not yet on main
pnpm auto:d
pnpm cf:deploy
```

Dashboard fallback: Workers Builds → **medscopeglobal** → Retry deployment.

---

## Related

- [`QUICK_START_PC.md`](./QUICK_START_PC.md)
- [`RESTORE_FROM_D.md`](./RESTORE_FROM_D.md)
- [`production-runbook.md`](./production-runbook.md)
