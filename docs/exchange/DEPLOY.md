# MedScope B2B Exchange — deploy

Production remains **Cloudflare Workers (OpenNext)** on `medscopeglobal.com`. Do not switch the live site to Vercel.

## Cloudflare (authoritative)

1. Apply SQL in order (see `docs/deploy/POST_MERGE_CHECKLIST.md` §2):
   - `supabase/migrations/20260910120000_b2b_exchange.sql`
   - `supabase/migrations/20260911120000_b2b_exchange_subscriptions.sql`
   - `supabase/migrations/20260911130000_b2b_exchange_demo_seed.sql` (sample catalog; `ON CONFLICT DO NOTHING`)
   - Cloud agent / operator without a local Management API token: `pnpm db:edge-apply-exchange` then `curl http://127.0.0.1:8788/` (uses production Worker `SUPABASE_ACCESS_TOKEN`).
   - After Worker deploy: `POST /api/cron/apply-exchange-migrations` with `Authorization: Bearer CRON_SECRET` or a Cloudflare API token (user **or** account-owned). Uses Worker `SUPABASE_ACCESS_TOKEN`.
2. Merge to `main` → Workers Builds / `pnpm cf:deploy`.
3. Smoke: `pnpm exec tsx scripts/exchange-check.ts` then `pnpm cf:smoke`.

Prisma `schema.prisma` is a **typed contract**. Runtime DDL is Supabase SQL. Do not run `prisma migrate deploy` against production.

Required Exchange env (in addition to existing Supabase keys):

- `DEEPL_API_KEY` (optional; Groq/passthrough fallback)
- `CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` for verify/backfill

## Pre-deployment checklist

1. `GET /api/exchange/health` → `revenueModel: subscription_only`, `dealCommissionPercent: 0`
2. Roles: Guest can inquire; Basic lists; Pro/Enterprise see contacts
3. Subscription cookie / `?as=pro` unlocks inquiries
4. Basic inquiry list is redacted (no email/phone)
5. Public listing/company pages do not show advertiser mailto
6. Regional filter `availability_region` EU/USA/Asia/Global
7. Locales `/cs` `/en` `/de` `/it` `/es` `/fr` `/pl` `/sk` `/hu`
8. Legal hub `/exchange/legal` (terms, privacy, cookies, advertising, disclaimer)
9. SEO: hreflang + sitemap entries for `/exchange`, `/catalog`, `/pricing`
10. `robots.txt` unchanged (public Exchange indexed; dashboard `noindex`)
11. CI: `pnpm test` includes `scripts/exchange-check.ts`
12. Deploy path: Cloudflare, not Vercel
13. `GET /api/exchange/observability` returns counters
14. Security: `withApiGuard` (origin, rate limit, sanitize, Prisma/SQL params)

## Non-production alternatives (not used for medscopeglobal.com)

A Vercel `vercel.json` / Docker image would only be a lab sandbox. Live traffic stays on Workers.
