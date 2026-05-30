# Nasazení: Supabase + Vercel + GitHub

## Projekt Supabase (medscopeglobal)

| | |
|---|---|
| **Název** | medscopeglobal |
| **Project ref** | `xcydgqnivxfhprbmdyym` |
| **Region** | eu-central-1 (Frankfurt) |
| **Database settings** | [otevřít v dashboardu](https://supabase.com/dashboard/project/xcydgqnivxfhprbmdyym/settings/database) |

## Rychlý setup (doporučeno)

### 1. Supabase — connection stringy

1. Otevřete [Database settings](https://supabase.com/dashboard/project/xcydgqnivxfhprbmdyym/settings/database)
2. Pokud neznáte heslo: **Reset database password** a uložte si ho
3. Z **Connection string** zkopírujte:
   - **Transaction pooler** (port `6543`, URI mode) → `DATABASE_URL`
   - **Direct connection** (port `5432`) → `DIRECT_URL`

Předvyplněné šablony (nahraďte `[PASSWORD]`):

```env
DATABASE_URL=postgresql://postgres.xcydgqnivxfhprbmdyym:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xcydgqnivxfhprbmdyym.supabase.co:5432/postgres
```

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
curl https://medscopeglobal.com/api/portal/status
# alternativně: /api/portal/health (rewrite) nebo /api/portal/sources?status=1
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

- `GET /api/portal/status` – stav databáze a počty záznamů
- `GET /api/portal/health` – alias (rewrite → status)
- `GET /api/portal/sources?status=1` – stejná odpověď
