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

Domény jsou přidané ve Vercel. V **Cloudflare DNS** pro `medscopeglobal.com` nastavte:

| Typ | Název | Hodnota |
|-----|--------|---------|
| A | `@` | `76.76.21.21` |
| A | `www` | `76.76.21.21` |

(Vypněte proxy „oranžový mrak“ u těchto záznamů, pokud Vercel neověří doménu.)

Dočasně funguje: https://medscopeglobal.vercel.app

## 6. Automatické články (cron)

Na Vercel Hobby běží **1× denně** (`0 6 * * *` v `vercel.json`).

Pro častější ingest (např. každých 6 h) použijte [cron-job.org](https://cron-job.org) na:

`GET https://medscopeglobal.com/api/cron/ingest?secret=CRON_SECRET`

Po deploy ověřte v prohlížeči (nahraďte secret):

`https://medscopeglobal.com/api/cron/ingest?secret=VÁŠ_CRON_SECRET`

## 7. Deploy

```bash
npm run build
npx vercel --prod
```

Nebo push do Git repozitáře propojeného s Vercel.

## 8. Kontrola po spuštění

- https://medscopeglobal.com — homepage, sekce, obory
- https://medscopeglobal.com/articles — články v jazyku zařízení
- https://medscopeglobal.com/categories — lokalizované názvy oborů
