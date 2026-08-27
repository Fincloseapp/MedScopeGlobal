# CONTINUE_STATUS

Updated: 2026-08-27 (cloud agent)

## Secrets in this pod
| Key | Visible |
|-----|---------|
| CLOUDFLARE_API_TOKEN | yes |
| CLOUDFLARE_ACCOUNT_ID | yes |
| STRIPE_SECRET_KEY | yes (sk_live) |
| SUPABASE_SERVICE_ROLE_KEY (local) | placeholder only — Worker secret used at runtime |
| NEXT_PUBLIC_SUPABASE_* | yes (real project) |

## Deploy
- **Status**: success
- **Command**: `pnpm cf:deploy`
- **Worker version**: `3f3b64a0-b594-4b4f-aa8e-038f906a2049`
- **Branch**: `cursor/fix-stripe-smoke-ts-c7e5` (fix: drop `.ts` import ext so pre-deploy `tsc` passes)
- **Base tip**: `9f6f7e08` donate checkout-fetch

## LIVE results (https://medscopeglobal.com)
| Check | Result |
|-------|--------|
| HEAD `/assets/marketing/mediflow.webp` | **200** `image/webp` |
| GET `/api/v29/health` → `stripe.httpClient` | **fetch** |
| POST `/api/ecosystem/donate` `{amount:2000,currency:czk}` | **200** + `checkout.stripe.com` URL in **~2.2s** (not hang) |
| `pnpm smoke:production` | **ok** |
| `pnpm smoke:ecosystem:production` | **ok** (27 checks) |

## Remaining (non-blocking)
- `stripe.webhookSecretConfigured=false` — Checkout works; fulfillment needs `STRIPE_WEBHOOK_SECRET` (`node scripts/setup-stripe-webhook.mjs` / Worker secret).
- Merge PR `cursor/fix-stripe-smoke-ts-c7e5` so main builds without the smoke TS gate failure.
