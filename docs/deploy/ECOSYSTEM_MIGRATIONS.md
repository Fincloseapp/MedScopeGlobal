# Ecosystem migrations (20260825*)

Apply three SQL migrations in order:

1. `supabase/migrations/20260825120000_mediflow_ecosystem.sql`
2. `supabase/migrations/20260825220000_editorial_redakce.sql`
3. `supabase/migrations/20260825230000_editorial_images.sql`

## Option A — Supabase SQL Editor

Paste each file into **SQL → New query** and run. Idempotent (`IF NOT EXISTS`).

## Option B — CLI (operator PC with tokens)

```bash
pnpm db:apply-ecosystem   # only the three 20260825* files
pnpm db:migrate           # all pending migrations
pnpm db:verify            # needs SUPABASE_SERVICE_ROLE_KEY
```

Requires `SUPABASE_ACCESS_TOKEN` in `.env.local` or `npx supabase login`.

## Option C — Production cron route

Worker secrets `SUPABASE_ACCESS_TOKEN` and `CRON_SECRET` are already set.

```bash
# From D:\medscope.local or any machine with CRON_SECRET
pnpm db:trigger-ecosystem-cron
# or raw curl:
curl -s -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://medscopeglobal.com/api/cron/apply-ecosystem-migrations | jq .
```

Auth fallbacks: `MIGRATION_BOOTSTRAP_TOKEN` (Worker secret), or a valid
`CLOUDFLARE_API_TOKEN` that verifies via Cloudflare's token API.

Deploy the route first if missing on production (`app/api/cron/apply-ecosystem-migrations`).

## Option D — Cloud Agent / wrangler remote (no local Supabase token)

When the agent has `CLOUDFLARE_API_TOKEN` but not `SUPABASE_ACCESS_TOKEN` or `CRON_SECRET`,
apply via a one-off Worker that reads `SUPABASE_ACCESS_TOKEN` from production secrets:

```bash
node scripts/generate-ecosystem-embedded-sql.mjs   # refresh embedded SQL if migrations changed
npx wrangler dev -c scripts/wrangler-edge-apply.jsonc --remote --port 8787
curl -s http://127.0.0.1:8787/ | jq .
```

Expected: `"ok": true` with three `"ok": true` results.

## Verify

Without service role, anon REST probes (HTTP 200 = table exists; 404/PGRST205 = missing):

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/mediflow_notes?select=id&limit=1"
```

Tables: `mediflow_notes`, `mediflow_symptoms`, `mediflow_supplements`, `mediflow_saved_articles`,
`article_syndications`, `editorial_queue`, `article_image_suggestions`.
