# Nasazení: Supabase + Vercel + GitHub

## 1. Supabase

1. V [Supabase Dashboard](https://supabase.com/dashboard) vytvořte projekt (region **EU** doporučen).
2. **Project Settings → Database → Connection string**
3. Zkopírujte:
   - **Transaction pooler** (port `6543`) → `DATABASE_URL`
   - **Session/Direct** (port `5432`) → `DIRECT_URL`

## 2. Vercel

1. Importujte repo [Fincloseapp/MedScopeGlobal](https://github.com/Fincloseapp/MedScopeGlobal)
2. Branch: `cursor/medical-portal-complete-da00` (nebo `main` po merge PR #6)
3. **Settings → Environment Variables** (Production + Preview):

| Proměnná | Hodnota |
|----------|---------|
| `DATABASE_URL` | Supabase pooler URL (port 6543, `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase direct URL (port 5432) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | `https://medscopeglobal.com` |

4. Deploy – build script automaticky spustí:
   - `prisma generate`
   - `prisma migrate deploy`
   - `node prisma/seed.mjs` (demo účty + ukázkový článek)
   - `next build`

## 3. GitHub

- CI běží na push/PR (`npm run ci`)
- Po merge PR #6 nastavte Vercel production branch na `main`

## 4. Ověření po deployi

1. Otevřete `/portal`
2. Přihlaste se: `expert@lf1.cuni.cz` / `Expert123!`
3. Vytvořte nebo publikujte článek v `/portal/manage`
4. Ověřte persistenci – refresh stránky, data zůstanou (Supabase)

## Demo účty (seed)

| Role | E-mail | Heslo |
|------|--------|-------|
| Reader | reader@example.com | Reader123! |
| Expert | expert@lf1.cuni.cz | Expert123! |
| Admin | admin@medscopeglobal.com | Admin123! |
