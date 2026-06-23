# Optimization recommendations — MedScopeGlobal

Pragmatic improvements identified during ENV + codebase scan. Prioritized by impact vs effort.

---

## 1. Environment & build

| Item | Impact | Effort | Notes |
|------|--------|--------|-------|
| Centralize env access | High | Medium | Extend `lib/env.ts` with typed getters for Stripe, cron, AI — reduces scattered `process.env` |
| Vercel env sync | High | Low | Use `scripts/diff-vercel-env.mjs` + `VERCEL_SYNC_KEYS` before each release |
| Build without secrets | Medium | Done | `lib/env.ts` placeholders for `NEXT_PHASE`; set `MEDSCOPE_SKIP_ENV_CHECK=1` in CI if needed |
| NTFS path defaults | Medium | Low | Update `lib/config/paths.ts` defaults from `D:\` to `C:\_NTFS\MedScopeGlobal\` when migration complete |

---

## 2. Next.js / Vercel performance

| Item | Impact | Notes |
|------|--------|-------|
| Image optimization | High | Two `<img>` usages remain intentional (dynamic Supabase/admin URLs) with eslint-disable; migrate to `next/image` where domains are stable |
| `outputFileTracingIncludes` | Done | V25 cron `.mjs` bundles already traced in `next.config.mjs` |
| Cache headers | Done | Static assets `max-age=31536000`; pages `s-maxage=120, stale-while-revalidate=600` |
| `compress: true` | Done | Enabled in config |
| Sitemap DB query | Medium | `app/sitemap.ts` fetches up to 5000 articles — consider incremental sitemap or edge cache |
| Server Components | Medium | Audit client components that only fetch data — convert to RSC where possible |

---

## 3. Database & Supabase

| Item | Impact | Notes |
|------|--------|-------|
| Connection pooling | High | Use `DATABASE_URL` with PgBouncer (6543) for scripts; Supabase JS client for app |
| RLS audit | High | Service role used in many admin routes — ensure authz before `createServiceRoleClient()` |
| Edge Functions | Medium | Cron proxies in `supabase/functions/*` — consolidate shared auth in `_shared/proxy-cron.ts` |
| Index review | Medium | Articles by `slug`, `published`; courses by `status` — verify indexes for sitemap/search |

---

## 4. AI & ingestion cost

| Item | Impact | Notes |
|------|--------|-------|
| Groq first | High | Free tier; already primary in `lib/ai/groq.ts` |
| Model fallbacks | Medium | Three Groq models configured — monitor latency vs quality |
| Ingest caps | Medium | `INGEST_MAX_ARTICLES=80` — tune for cron budget |
| Translation | Medium | Prefer Groq/Gemini over Google Translate API for cost |

---

## 5. Security

| Item | Status | Notes |
|------|--------|-------|
| `security.txt` | Done | `public/.well-known/security.txt` |
| Turnstile | Optional | Forms degrade gracefully when keys missing (`lib/security/captcha.ts`) |
| Cron auth | Required | `CRON_SECRET` validated in `lib/v6/cron-auth.ts` |
| Stripe webhooks | Required | Verify `STRIPE_WEBHOOK_SECRET` in production |
| Admin IP allowlist | Optional | `ADMIN_IP_ALLOWLIST` for extra admin hardening |

---

## 6. Accessibility (quick wins)

| Item | Status | Notes |
|------|--------|-------|
| `@next/next/no-img-element` | N/A | Two admin/public components use `<img>` with eslint-disable — dynamic URLs; add meaningful `alt` on `daily-tip-banner` (currently empty) |
| Focus / contrast | — | Run Lighthouse on `/`, `/academy`, `/admin` |
| Skip links | — | Verify main landmark on public layout |

---

## 7. Monitoring & ops

| Item | Notes |
|------|-------|
| Health endpoints | `/api/health`, `/api/v28/health`, … — consolidate or document canonical |
| Production scripts | `tests/production/verify-v19.9.mjs` needs `CRON_SECRET` |
| Datadog / Sentry | Not integrated — consider for production error tracking |
| Upstash Redis | Configure for distributed rate limiting on Vercel (`lib/v30/security/rate-limit.ts`) |

---

## 8. Mobile (Expo)

| Item | Notes |
|------|-------|
| Env parity | Mirror Supabase keys as `EXPO_PUBLIC_*` in EAS secrets |
| API base | `EXPO_PUBLIC_API_BASE` defaults to production — use staging URL for preview builds |

---

## Suggested next steps (build agent / follow-up)

1. Full `next build` on Vercel with production env (not run in this phase).
2. Lighthouse CI on critical routes.
3. Migrate `MEDSCOPE_*` path defaults to `C:\_NTFS\MedScopeGlobal\` after data migration.
4. Add `alt={video.title}` on daily tip banner thumbnail.
5. Enable Upstash Redis in Vercel for rate limits.
