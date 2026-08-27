# CONTINUE_STATUS

Updated: 2026-08-27 (cloud agent — post-merge + webhook attempt)

## Secrets in this pod
| Key | Visible |
|-----|---------|
| CLOUDFLARE_API_TOKEN | yes |
| CLOUDFLARE_ACCOUNT_ID | yes |
| STRIPE_SECRET_KEY | yes (sk_live) |
| STRIPE_WEBHOOK_SECRET | yes in process.env (not logged) |
| SUPABASE_SERVICE_ROLE_KEY (local) | placeholder only — Worker secret used at runtime |
| NEXT_PUBLIC_SUPABASE_* | yes (real project) |

## Git merges → `main` (pushed)
| Branch | Merge commit on main | Tip SHA |
|--------|----------------------|---------|
| `cursor/fix-stripe-smoke-ts-c7e5` | `93788f80` | `074d1809` (tsc smoke `.ts` import drop + this status file) |
| `cursor/fix-tip-no-vip-tringelt-2b2d` | `7cb2f513` (HEAD) | `b58e00bc` (Příspěvek/Dar; tip ≠ VIP) |

**Not merged:** `cursor/article-ux-readable-2b2d` (`4c4befa9`) — **conflicts** with tip on `app/(public)/article/[slug]/page.tsx` (and related monetization UI). Resolve when landing article-ux.

## Deploy / live Worker
- **Live version**: `3f3b64a0-b594-4b4f-aa8e-038f906a2049` (known-good; donate + mediflow OK)
- **Webhook on live**: still **false** — see below

## LIVE results (https://medscopeglobal.com)
| Check | Result |
|-------|--------|
| HEAD `/assets/marketing/mediflow.webp` | **200** `image/webp` |
| GET `/api/v29/health` → `stripe.httpClient` | **fetch** |
| GET `/api/v29/health` → `webhookSecretConfigured` | **false** (live version lacks secret) |
| POST `/api/ecosystem/donate` `{amount:2000,currency:czk}` | **200** + `checkout.stripe.com` URL in **~0.5s** |

## STRIPE_WEBHOOK_SECRET attempt
- Secret **is** in agent `process.env`.
- Classic `wrangler secret put` **failed**: latest upload ≠ live deployment.
- `wrangler versions secret put` created versions based on **broken latest** (`aa2bd83c` lineage). Deploying one (`9031bcf8`) caused **/health + donate 500** → immediately rolled back to `3f3b64a0`.
- Secret **name** appears in `wrangler secret list` from those version experiments, but **live traffic** still reports `webhookSecretConfigured=false`.
- **Safe next step** (documented in `docs/deploy/STRIPE_DONATIONS.md`): healthy `pnpm cf:deploy` so latest == live, then:
  `printf '%s' "$STRIPE_WEBHOOK_SECRET" | npx wrangler secret put STRIPE_WEBHOOK_SECRET --name medscopeglobal`
  (do **not** log the value).
