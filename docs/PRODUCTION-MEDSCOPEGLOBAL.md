# Nasazení na https://medscopeglobal.com

## Rychlý start (lokálně)

```bash
npm install
npm run production:finalize
```

Potřebujete v `.env.local` alespoň Supabase klíče. Pro **automatickou migraci** přidejte jednu z možností:

- `DATABASE_URL` (Supabase → Settings → Database → URI) → `npm run db:apply-pg`
- `SUPABASE_ACCESS_TOKEN` → `npm run db:setup`

Pro **plné AI články a překlady** doplňte `OPENAI_API_KEY=sk-...`.

## 1. Supabase (jednorázově)

**Chybějící tabulky** (překlady, cron log, rubrics):

```bash
npm run db:apply-pg
```

(nejdřív `DATABASE_URL` v `.env.local` ze Supabase → Database → URI)

nebo v [SQL Editor](https://supabase.com/dashboard/project/xcydgqnivxfhprbmdyym/sql/new) spusťte celý soubor:

`supabase/MISSING_PRODUCTION_TABLES.sql`

Kompletní schéma (pokud ještě neběželo): `supabase/APPLY_IN_DASHBOARD.sql`

```bash
npm run db:verify
```

## 2. Obsah (kategorie + články)

```bash
npm run production:bootstrap
```

Volitelně v `.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://medscopeglobal.com
INGESTION_LOCALE=cs
OPENAI_API_KEY=sk-...
```

## 3. Vercel — proměnné prostředí

| Proměnná | Hodnota |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | z Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | z Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | z Supabase (tajné) |
| `NEXT_PUBLIC_SITE_URL` | `https://medscopeglobal.com` |
| `CRON_SECRET` | dlouhý náhodný řetězec |
| `OPENAI_API_KEY` | pro AI články a překlady |
| `INGESTION_LOCALE` | `cs` |

## 4. Supabase Auth

Authentication → URL Configuration:

- **Site URL:** `https://medscopeglobal.com`
- **Redirect URLs:** `https://medscopeglobal.com/auth/callback`

## 5. Doména (Cloudflare)

DNS a Worker routy jsou v `wrangler.jsonc` (`medscopeglobal.com/*`, `www.medscopeglobal.com/*`).
Proxy (oranžový mrak) zůstává zapnutá — provoz jde na Cloudflare Workers.

Live: https://medscopeglobal.com

## 6. Automatické články (cron)

Cron běží přes GitHub Actions `.github/workflows/cloudflare-cron.yml`.

Pro ruční ingest:

`GET https://medscopeglobal.com/api/cron/ingest` s hlavičkou `Authorization: Bearer CRON_SECRET`

## 7. Deploy

```bash
pnpm cf:deploy
```

Nebo push do `main` (workflow `cloudflare-deploy.yml`).

## 8. Kontrola po spuštění

- https://medscopeglobal.com — homepage, sekce, obory
- https://medscopeglobal.com/articles — články v jazyku zařízení
- https://medscopeglobal.com/categories — lokalizované názvy oborů
