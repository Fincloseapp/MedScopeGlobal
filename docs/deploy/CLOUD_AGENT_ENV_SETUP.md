# Cloud Agent environment setup (no Cursor Secrets)

Use this when a Cloud Agent pod starts **without** Cursor Secrets (`SUPABASE_SERVICE_ROLE_KEY`,
`SUPABASE_ACCESS_TOKEN`, `CRON_SECRET`) but you still need to develop, verify, and finish
ecosystem migration rollout.

Related: [`MANUAL_OPERATOR_CHECKLIST.md`](./MANUAL_OPERATOR_CHECKLIST.md), [`POST_MERGE_CHECKLIST.md`](./POST_MERGE_CHECKLIST.md), [`production-runbook.md`](./production-runbook.md),
[`RESTORE_FROM_D.md`](./RESTORE_FROM_D.md).

---

## 1. Minimum `.env.local` (dev server boot)

Create or restore `.env.local` at the repo root (git-ignored). These two are **required** for
`pnpm dev` / `getPublicEnv()`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-jwt>
NEXT_PUBLIC_SITE_URL=https://medscopeglobal.com
SUPABASE_PROJECT_REF=<ref>
```

Optional for deploy from the agent (session-only — never commit):

```env
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

Public anon values can be copied from production `__MEDSCOPE_PUBLIC__` or Supabase dashboard →
**Project Settings → API**. Placeholder URLs/keys are enough to boot the dev server; real keys
unlock auth, articles SSR, and admin CMS.

---

## 2. What works without service-role / access tokens

| Command | Works? | Notes |
|---------|--------|-------|
| `pnpm typecheck` | ✓ | No Supabase needed |
| `pnpm lint` | ✓ | |
| `pnpm test` | ✓ | Functional-check only |
| `pnpm dev` / `pnpm dev:d`* | ✓ | With public Supabase vars above; *`dev:d` on branches that define it |
| PWA smoke (`/`, `/app/priprava`, `/app/pacient`, `/app/dokumentace`) | ✓ | Degrades without login |
| `pnpm smoke:production` | ✓ | Hits live medscopeglobal.com |
| `pnpm db:migrate` | ✗ | Needs `SUPABASE_ACCESS_TOKEN` |
| `pnpm db:verify` | partial | Service role preferred; anon may show `PGRST205` for ecosystem tables |
| `pnpm cf:deploy` | ✓* | *If `CLOUDFLARE_API_TOKEN` in `.env.local` or process env |

---

## 3. Apply ecosystem migrations (20260825*)

Three SQL files — run **in order**:

1. `supabase/migrations/20260825120000_mediflow_ecosystem.sql`
2. `supabase/migrations/20260825220000_editorial_redakce.sql`
3. `supabase/migrations/20260825230000_editorial_images.sql`

### Option A — Supabase SQL Editor (recommended when agent lacks tokens)

1. Open [Supabase dashboard](https://supabase.com/dashboard) → project **xcydgqnivxfhprbmdyym**.
2. **SQL → New query** → paste file 1 → **Run**.
3. Repeat for files 2 and 3.
4. Idempotent (`IF NOT EXISTS`); safe to re-run.

### Option B — Production cron route (after deploy includes the route)

The Worker already has `SUPABASE_ACCESS_TOKEN` and `CRON_SECRET` as secrets. Once
`/api/cron/apply-ecosystem-migrations` is deployed (branch `cursor/apply-ecosystem-migrations-1c5f`
or later merged to `main`):

**From Windows D: or any machine with secrets:**

```bash
# Using CRON_SECRET from D:\medscope.local\.env.local
curl -s -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://medscopeglobal.com/api/cron/apply-ecosystem-migrations | jq .

# PowerShell equivalent on D:
# $s = (Get-Content D:\medscope.local\.env.local | ? { $_ -match '^CRON_SECRET=' }) -split '=',2 | Select -Last 1
# Invoke-RestMethod -Method POST -Uri https://medscopeglobal.com/api/cron/apply-ecosystem-migrations -Headers @{ Authorization = "Bearer $($s.Trim().Trim('"'))" }
```

Expected success body:

```json
{
  "ok": true,
  "projectRef": "xcydgqnivxfhprbmdyym",
  "results": [
    { "name": "20260825120000_mediflow_ecosystem", "ok": true },
    { "name": "20260825220000_editorial_redakce", "ok": true },
    { "name": "20260825230000_editorial_images", "ok": true }
  ]
}
```

**Auth fallback:** If you only have a Cloudflare API token (not `CRON_SECRET`), the route accepts
`Authorization: Bearer <CLOUDFLARE_API_TOKEN>` when the token verifies via Cloudflare's API.

### Option C — CLI from operator PC

On `D:\medscope.local` with full `.env.local`:

```bash
pnpm db:migrate
pnpm db:verify
```

---

## 4. Verify migrations applied

On a machine with `SUPABASE_SERVICE_ROLE_KEY`:

```bash
pnpm db:verify
```

Look for ✓ on `mediflow_*`, `article_syndications`, `editorial_queue`, `article_image_suggestions`.

Without service role, anon REST probe returning **`PGRST205`** (relation does not exist) means
migrations are still pending.

---

## 5. Production smoke (always runnable)

```bash
pnpm smoke:production
# optional override:
# MEDSCOPE_ORIGIN=https://medscopeglobal.com pnpm smoke:production
```

Also: `pnpm cf:smoke` for full PWA/manifest checks.

---

## 6. Secrets for a future Cloud Agent run

Add these in **Cursor → Cloud Agent → Secrets** (or restore via `pnpm restore:d` on PC) when you
need full DB/admin workflows in the agent:

| Secret | Purpose |
|--------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Article SSR, `db:verify`, editorial backfill |
| `SUPABASE_ACCESS_TOKEN` | `pnpm db:migrate`, Management API |
| `CRON_SECRET` | Trigger production crons locally |

Worker-side copies already exist for production runtime; local/agent copies unlock operator scripts.

---

## 7. Security note

Cloud Agent sessions may use short-lived `CLOUDFLARE_API_TOKEN` in `.env.local`. **Rotate** that
token and Supabase keys after the session if they appeared in logs. See `AGENTS.md` § Security.
