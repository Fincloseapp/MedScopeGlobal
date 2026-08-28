# PC operator: article expand + image backfill

Cloud agents often have a **placeholder or stale** `SUPABASE_SERVICE_ROLE_KEY` (API returns `Invalid API key`) and may lack `CRON_SECRET`. DB writes for short-article expand and editorial image apply must run on the Windows PC from `D:\medscope.local`.

Do **not** commit `.env.local`. Never paste secret values into chat or PRs.

**Canonical paths:** project `D:\medscope.local` · data `D:\medscope.data` · backups `D:\medscope.data\backups\YYYY-MM-DD\`

Related: [`RESTORE_FROM_D.md`](./RESTORE_FROM_D.md) · [`QUICK_START_PC.md`](./QUICK_START_PC.md) · [`MANUAL_OPERATOR_CHECKLIST.md`](./MANUAL_OPERATOR_CHECKLIST.md)

---

## 1. Restore secrets + verify DB

```powershell
cd D:\medscope.local
git pull origin main
pnpm restore:d
pnpm db:verify
```

Expect ✓ for `articles`, `article_syndications`, `editorial_queue`, `article_image_suggestions`, and `mediflow_*`.

Confirm keys exist (names only — do not print values):

```powershell
Select-String -Path .\.env.local -Pattern '^(SUPABASE_SERVICE_ROLE_KEY|CRON_SECRET)=' |
  ForEach-Object { ($_.Line -split '=',2)[0] }
```

If `db:verify` still shows `Invalid API key`, fix `SUPABASE_SERVICE_ROLE_KEY` from the newest D: backup (or Supabase dashboard → Settings → API → service_role), then re-run `pnpm restore:d` / copy into `.env.local` and `pnpm db:verify` again.

Optional full auto (restore + backup + verify + deploy): `pnpm auto:d` or skip deploy with `pnpm auto:d -- -SkipDeploy`.

---

## 2. Backfill article images (apply, limited batch)

Dry-run first, then apply:

```powershell
cd D:\medscope.local
node scripts/editorial/backfill-article-images.mjs --limit=20
node scripts/editorial/backfill-article-images.mjs --apply --limit=20
```

Repeat `--apply --limit=20` until candidates are exhausted, or raise the limit once credentials are confirmed.

---

## 3. Regenerate ALL short public articles

Requires a valid service role **and** at least one LLM key (`GROQ_API_KEY` / `OPENAI_API_KEY` / Gemini). Default batch size is 30 — use a high `--limit` to cover the full short set:

```powershell
cd D:\medscope.local
# Preview candidates
node scripts/regenerate-short-public.mjs --dry-run --min-words=1100 --limit=500

# Expand all short public articles (long-running; AI rate limits apply)
node scripts/regenerate-short-public.mjs --expand --min-words=1100 --expand-target=1500 --limit=500
```

Single-slug check (Mediterranean example):

```powershell
node scripts/regenerate-short-public.mjs --slug=verejnost-zivotni-styl-stredomorsky-talir --expand --min-words=1100
```

---

## 4. POST editorial images cron (`CRON_SECRET`)

Load `CRON_SECRET` from `.env.local` without echoing it, then call production:

```powershell
cd D:\medscope.local
$cron = (Get-Content .\.env.local | Where-Object { $_ -match '^CRON_SECRET=' } |
  ForEach-Object { ($_ -split '=',2)[1].Trim().Trim('"') })
if (-not $cron -or $cron.Length -lt 32) { throw 'CRON_SECRET missing or too short in .env.local' }

# Dry suggestions
curl.exe -s -X POST `
  -H "Authorization: Bearer $cron" `
  -H "Content-Type: application/json" `
  -d '{\"limit\":20,\"dryRun\":true}' `
  https://medscopeglobal.com/api/ecosystem/editorial/images

# Apply suggestions
curl.exe -s -X POST `
  -H "Authorization: Bearer $cron" `
  -H "Content-Type: application/json" `
  -d '{\"limit\":20,\"apply\":true}' `
  https://medscopeglobal.com/api/ecosystem/editorial/images
```

Expect JSON with `"task": "editorial-images"` (and no 401). Ensure Worker + GitHub `CRON_SECRET` match `.env.local`.

---

## 5. Verify Mediterranean article URL

After expand / cover work:

- Production: https://medscopeglobal.com/article/verejnost-zivotni-styl-stredomorsky-talir
- Local (with `pnpm dev`): http://localhost:3000/article/verejnost-zivotni-styl-stredomorsky-talir

Slug: `verejnost-zivotni-styl-stredomorsky-talir` (středomořský talíř — food cover topic).

```powershell
curl.exe -sI https://medscopeglobal.com/article/verejnost-zivotni-styl-stredomorsky-talir
# Expect HTTP/2 200 (or 308→200). Body should be long-form Czech, not a short stub.
```

Optional suite against production:

```powershell
pnpm verify:articles
```

---

## Cloud agent status (this checklist exists because)

| Secret | Typical cloud probe |
|--------|---------------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Present but **Invalid API key** against live project |
| `CRON_SECRET` | Often **missing** (needed for editorial-images POST) |

When PC restore makes service role valid, hand expand / full regenerate to the content agent — do not start a massive regenerate from a credentials-only lane.
