# PC operator: article expand + image backfill

Cloud agents often have a **placeholder or stale** `SUPABASE_SERVICE_ROLE_KEY` (API returns `Invalid API key`) and may lack LLM keys / `CRON_SECRET`. DB writes for short-article expand must run on the Windows PC from `D:\medscope.local`.

Do **not** commit `.env.local`. Never paste secret values into chat or PRs.

**Canonical paths:** project `D:\medscope.local` · data `D:\medscope.data` · backups `D:\medscope.data\backups\YYYY-MM-DD\`

Related: [`RESTORE_FROM_D.md`](./RESTORE_FROM_D.md) · [`QUICK_START_PC.md`](./QUICK_START_PC.md) · [`ARTICLE_LENGTH_AUDIT.md`](../editorial/ARTICLE_LENGTH_AUDIT.md)

---

## Inventory snapshot (production scrape, 2026-08-28)

| Metric | Count |
|--------|------:|
| Unique public published scraped | **587** |
| ≥800 words (magazine) | **206** |
| <800 words (need expand) | **381** |
| Expanded from cloud session | **0** (service role invalid) |
| Short currently on `/articles` / homepage | **0** |

User Mediterranean URL is already longform:

- `verejnost-zivotni-styl-2026-06-23-stredomorsky-talir-v-ceske-kuchyni-vyvazena-strava-bez-extremu` → **~1320–1340 words**, cover `food-4.webp`

Re-audit: `pnpm audit:article-length`

---

## 1. Restore secrets + verify DB

```powershell
cd D:\medscope.local
git pull origin main
pnpm restore:d
pnpm db:verify
```

Expect ✓ for `articles`, `article_syndications`, `editorial_queue`, `article_image_suggestions`, and `mediflow_*`.

```powershell
Select-String -Path .\.env.local -Pattern '^(SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|GROQ_API_KEY|GEMINI_API_KEY|CRON_SECRET)=' |
  ForEach-Object { ($_.Line -split '=',2)[0] }
```

Need a valid service role **and** at least one LLM key. If `db:verify` shows `Invalid API key`, fix from D: backup / Supabase dashboard.

---

## 2. Expand ALL short public articles (800–1500 Czech longform)

```powershell
cd D:\medscope.local
$env:MEDSCOPE_PROJECT_ROOT = "D:\medscope.local"

node scripts/regenerate-short-public.mjs --dry-run --min-words=800 --limit=500

node scripts/regenerate-short-public.mjs --expand --min-words=800 --expand-target=1200 --limit=500 --delay-ms=12000

# Optional second pass for stubborn shorts:
node scripts/regenerate-short-public.mjs --expand-only --min-words=800 --expand-target=1200 --limit=500
```

Mediterranean (already ≥800 — re-run only if it regresses):

```powershell
node scripts/regenerate-short-public.mjs --slug=verejnost-zivotni-styl-2026-06-23-stredomorsky-talir-v-ceske-kuchyni-vyvazena-strava-bez-extremu --expand --min-words=800 --expand-target=1200
```

Verify:

```powershell
pnpm audit:article-length
pnpm verify:articles
```

---

## 3. Image backfill / cron (optional)

```powershell
node scripts/editorial/backfill-article-images.mjs --apply --limit=20
```

```powershell
$cron = (Get-Content .\.env.local | Where-Object { $_ -match '^CRON_SECRET=' } |
  ForEach-Object { ($_ -split '=',2)[1].Trim().Trim('"') })
curl.exe -s -X POST -H "Authorization: Bearer $cron" -H "Content-Type: application/json" `
  -d '{\"limit\":20,\"apply\":true}' `
  https://medscopeglobal.com/api/ecosystem/editorial/images
```

---

## Cloud agent status

| Secret | Probe |
|--------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | Present but **Invalid API key** |
| Anon key | Metadata only (no `content`) |
| LLM keys | Missing in cloud |
| Expand from cloud | **Blocked** — run §2 on PC |

Listing filter hides any article under 800 words until PC expand lands.
