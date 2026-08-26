# Post-merge production verification — PR #19 (VitaScope ecosystem)

Use this checklist after merging **PR #19** (`cursor/global-health-ecosystem-2b2d` → `main`) to confirm **https://medscopeglobal.com** serves the VitaScope / MediFlow / VIP ecosystem on Cloudflare Workers.

Related: [`production-runbook.md`](./production-runbook.md) (full deploy), [`RESTORE_FROM_D.md`](./RESTORE_FROM_D.md) (D: secrets restore).

---

## 0. Pre-merge (do before clicking Merge)

On the operator machine (`D:\medscope.local` or cloud workspace with real `.env.local`):

```bash
pnpm deploy:checklist    # typecheck + functional-check + db:verify
pnpm typecheck
pnpm test
```

Confirm Cloudflare / GitHub secrets are ready (see §2). **Do not merge** if `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, or live Stripe keys are still placeholders on the Worker.

---

## 1. Merge PR #19

### GitHub UI

1. Open **PR #19** — *Global health ecosystem: MediFlow, VIP protocols, Supabase integration*.
2. Ensure CI is green (or acceptable warnings only).
3. **Squash merge** or **Create merge commit** into `main` (team preference).
4. Delete the feature branch only after verification passes (optional).

### Git CLI (alternative)

```bash
git checkout main
git pull origin main
git merge origin/cursor/global-health-ecosystem-2b2d
git push origin main
```

### What triggers deploy

| Path | Trigger | Notes |
|------|---------|-------|
| **Cloudflare Workers Builds** | Push to `main` | Preferred if dashboard project **`medscopeglobal`** is connected to GitHub |
| **GitHub Actions** | Push to `main` | `.github/workflows/cloudflare-deploy.yml` — needs `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, optional `CLOUDFLARE_ENV_JSON` |

Both paths build with `npm run cf:build` (OpenNext) and deploy via `opennextjs-cloudflare`. **Only one should be active** to avoid double deploys; disable the redundant trigger if both fire on every push.

### Workers Builds vs GitHub Actions

| | **Workers Builds** (dashboard) | **GitHub Actions** (`cloudflare-deploy.yml`) |
|---|--------------------------------|---------------------------------------------|
| **Config** | Cloudflare → Workers & Pages → **medscopeglobal** → Settings | Repo → Settings → Secrets → Actions |
| **Secrets** | Dashboard → Variables and Secrets (per key) | `CLOUDFLARE_ENV_JSON` (full JSON from `pnpm cf:env:sync`) |
| **Build cmd** | `npm run cf:build` | same via `pnpm cf:deploy` |
| **Deploy cmd** | `npx opennextjs-cloudflare deploy` | wrapped in `pnpm cf:deploy` |
| **Post-deploy smoke** | Manual (`pnpm smoke:production`) | Runs `scripts/cloudflare/smoke-production.mjs` automatically |
| **When to use** | Day-to-day; no GH token rotation | CI audit trail; same artifact as local `pnpm cf:deploy` |

**Manual deploy** (either path failed or hotfix):

```bash
pnpm cf:env:sync          # Windows D: — writes scripts/cloudflare/.env.cloudflare.json
pnpm cf:deploy
pnpm smoke:production
```

---

## 2. Supabase migrations (apply before or immediately after deploy)

Apply **in this order** (ecosystem tables for MediFlow + editorial):

| Order | File | Purpose |
|------:|------|---------|
| 1 | `supabase/migrations/20260825120000_mediflow_ecosystem.sql` | MediFlow tables, RLS, donation index |
| 2 | `supabase/migrations/20260825220000_editorial_redakce.sql` | `article_syndications`, `editorial_queue` |
| 3 | `supabase/migrations/20260825230000_editorial_images.sql` | `article_image_suggestions`, `editorial_queue.task_type` |

### Option A — Supabase SQL Editor (prod-safe)

Paste and run each file **1 → 2 → 3** in the [SQL Editor](https://supabase.com/dashboard). Idempotent (`IF NOT EXISTS`).

### Option B — CLI from operator machine

Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_ACCESS_TOKEN` (or `npx supabase login`):

```bash
pnpm db:migrate
pnpm db:verify
```

Expect ✓ for `mediflow_*`, `article_syndications`, `editorial_queue`, `article_image_suggestions`.

---

## 3. Wait for deploy, then smoke

Allow **2–5 minutes** after push for Workers Builds / Actions to finish. Watch:

- Cloudflare dashboard → **medscopeglobal** → Deployments
- GitHub → **Actions** → *Cloudflare Workers Deploy*

### One command (recommended)

```bash
pnpm smoke:production
# override staging/preview:
# MEDSCOPE_ORIGIN=https://preview.example.com pnpm smoke:production
```

Uses `MEDSCOPE_ORIGIN` (default `https://medscopeglobal.com`). Fails on non-2xx or missing VitaScope / MediFlow / VIP / SEO markers.

### Legacy full PWA smoke

```bash
pnpm cf:smoke
# uses SMOKE_BASE_URL (default https://medscopeglobal.com)
```

Covers PWAs, manifests, demo APIs — run after ecosystem smoke passes.

---

## 4. Manual curl checks (PR #19 surfaces)

Replace the host if testing a preview Worker.

```bash
export ORIGIN="${MEDSCOPE_ORIGIN:-https://medscopeglobal.com}"

# Czech homepage — must contain VitaScope branding
curl -sL "$ORIGIN/cs" | grep -i VitaScope

# English homepage
curl -sL "$ORIGIN/en-us" | grep -iE 'VitaScope|MediFlow|health'

# MediFlow marketing hub
curl -sL "$ORIGIN/mediflow" | grep -i MediFlow

# VIP longevity protocols listing
curl -sL "$ORIGIN/vip/protokoly" | grep -iE 'protokol|Longevity|VIP'

# SEO files
curl -sL "$ORIGIN/robots.txt" | grep -i Sitemap
curl -sL "$ORIGIN/sitemap-cs.xml" | grep -i urlset
```

### Windows PowerShell equivalents

```powershell
$Origin = "https://medscopeglobal.com"
(Invoke-WebRequest -Uri "$Origin/cs" -UseBasicParsing).Content | Select-String -Pattern 'VitaScope'
(Invoke-WebRequest -Uri "$Origin/en-us" -UseBasicParsing).Content | Select-String -Pattern 'VitaScope|MediFlow'
(Invoke-WebRequest -Uri "$Origin/mediflow" -UseBasicParsing).Content | Select-String -Pattern 'MediFlow'
(Invoke-WebRequest -Uri "$Origin/vip/protokoly" -UseBasicParsing).Content | Select-String -Pattern 'protokol|VIP'
(Invoke-WebRequest -Uri "$Origin/robots.txt" -UseBasicParsing).Content | Select-String -Pattern 'Sitemap'
(Invoke-WebRequest -Uri "$Origin/sitemap-cs.xml" -UseBasicParsing).Content | Select-String -Pattern 'urlset'
```

### Quick status-only pass

```bash
for path in /cs /en-us /mediflow /vip/protokoly /robots.txt /sitemap-cs.xml; do
  code=$(curl -sL -o /dev/null -w '%{http_code}' "$ORIGIN$path")
  echo "$code $path"
done
```

All paths should return **200** (root `/` may 307 → `/cs`).

---

## 5. Editorial image backfill (post-deploy, once)

Populates `cover_image_url` for published articles missing hero images. Requires `SUPABASE_SERVICE_ROLE_KEY` on the operator machine.

```bash
# Dry-run — list candidates only
node scripts/editorial/backfill-article-images.mjs

# Apply first production batch (recommended)
node scripts/editorial/backfill-article-images.mjs --apply --limit=50
```

Optional: `UNSPLASH_ACCESS_KEY` expands live image search; without it, curated Unsplash URLs + SVG fallbacks still apply.

Re-verify article cards:

```bash
pnpm verify:articles
curl -sL "$ORIGIN/cs/articles" | grep -i 'article/'
```

---

## 6. Cron spot-check (optional, same day)

Requires `CRON_SECRET` matching Worker + GitHub:

```bash
curl -s -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://medscopeglobal.com/api/cron/ecosystem-mediflow | jq .

curl -s -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"task":"editorial-queue"}' \
  https://medscopeglobal.com/api/ecosystem/autonomous | jq .
```

---

## 7. Sign-off checklist

- [ ] PR #19 merged to `main`
- [ ] Deploy succeeded (Workers Builds **or** GitHub Actions — not both failing)
- [ ] Migrations 1–3 applied; `pnpm db:verify` exit 0
- [ ] `pnpm smoke:production` exit 0
- [ ] `/cs` shows **VitaScope** (curl grep)
- [ ] `/mediflow`, `/vip/protokoly`, `/robots.txt`, `/sitemap-cs.xml` reachable
- [ ] `backfill-article-images.mjs --apply --limit=50` run (or scheduled)
- [ ] `GET /api/health` → `"ok": true`, `"cloudflare": true`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `/cs` 200 but no VitaScope | Old Worker version — redeploy; confirm merge reached `main` |
| Empty article hubs | `SUPABASE_SERVICE_ROLE_KEY` missing on Worker |
| `/sitemap-cs.xml` 404 | PR #19 not deployed; check `app/sitemaps/[locale]/route.ts` |
| MediFlow API 503 | Migration 1 not applied |
| Smoke passes locally, prod fails | Dashboard secrets out of sync — `pnpm cf:env:sync` → update Worker vars |

Health: `curl -s https://medscopeglobal.com/api/health | jq .`
