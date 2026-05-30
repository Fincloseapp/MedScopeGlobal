# Nasazení: Supabase + Vercel + GitHub

## Rychlý setup (doporučeno)

### 1. Supabase

1. [Supabase Dashboard](https://supabase.com/dashboard) → **New project** (region EU)
2. **Project Settings → Database → Connection string**
3. Zkopírujte:
   - **Transaction pooler** (port `6543`) → `DATABASE_URL`
   - **Direct connection** (port `5432`) → `DIRECT_URL`

### 2. Automatická konfigurace

```bash
cp .env.production.local.example .env.production.local
# vyplňte DATABASE_URL a DIRECT_URL ze Supabase
npm run setup:production
```

Skript:
- ověří připojení k DB
- spustí migrace + seed (demo účty + článek)
- nastaví env vars ve Vercel (po `vercel login`)

### 3. Ruční nastavení ve Vercel

**Settings → Environment Variables** (Production):

| Proměnná | Hodnota |
|----------|---------|
| `DATABASE_URL` | Supabase pooler (6543, `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase direct (5432) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | `https://medscopeglobal.com` |

→ **Redeploy** production branch `main`

### 4. Ověření

```bash
curl https://medscopeglobal.com/api/portal/health
```

Očekávaná odpověď:
```json
{"ok":true,"database":"connected","configured":true,"articles":1,"users":3}
```

Pak:
1. `/portal` – bez varování o DB
2. Login `expert@lf1.cuni.cz` / `Expert123!`
3. Generování + publikace článku
4. Uložení + hodnocení – data přetrvávají po refreshi

## Demo účty (seed)

| Role | E-mail | Heslo |
|------|--------|-------|
| Reader | reader@example.com | Reader123! |
| Expert | expert@lf1.cuni.cz | Expert123! |
| Admin | admin@medscopeglobal.com | Admin123! |

## Health endpoint

`GET /api/portal/health` – stav databáze a počty záznamů
