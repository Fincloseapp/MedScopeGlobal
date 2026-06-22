# MedScopeGlobal — detailní kroky ke spuštění

Kompletní průvodce: databáze → env → admin → **automatické stahování článků** → cron → produkce.

---

## Fáze 1 — Supabase (15 min)

1. Vytvořte projekt na [supabase.com](https://supabase.com).
2. V **SQL Editor** spusťte **v tomto pořadí**:
   - `supabase/migrations/20240525000000_initial_schema.sql`
   - `supabase/migrations/20240525000001_magazine_platform.sql`
   - `supabase/migrations/20240525000002_ingestion.sql`
   - `supabase/seed-medical.sql`
3. **Authentication → Providers**: zapněte Email (volitelně Google).
4. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect: `http://localhost:3000/auth/callback`
5. Zkopírujte z **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY` (tajné, jen server)

---

## Fáze 2 — Lokální prostředí (5 min)

```bash
cd d:\MedScopeGlobal
cp .env.example .env.local
npm install
```

Vyplňte `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Povinné pro plnou AI syntézu článků
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Cron / automatické stahování (vygenerujte náhodný řetězec)
CRON_SECRET=your-long-random-secret

ADMIN_NOTIFY_EMAIL=dawe.zegzul@seznam.cz
```

Spuštění:

```bash
npm run dev
```

Otevřete: http://localhost:3000

---

## Fáze 3 — První admin (5 min)

1. Registrace: http://localhost:3000/signup  
   - Zvolte úroveň přístupu a profesi.
2. V Supabase **Authentication → Users** zkopírujte UUID.
3. SQL Editor:

```sql
update public.users set role = 'admin' where id = 'VÁŠE-UUID';
```

4. Přihlášení → http://localhost:3000/admin

---

## Fáze 4 — Automatické články z odborných zdrojů (10 min)

### Co systém dělá automaticky

| Zdroj | Typ |
|-------|-----|
| WHO, NIH, CDC, BMJ, Lancet, EMA | RSS |
| PubMed (E-utilities) | Podle oboru (kardiologie, onkologie, …) |

Pro každý nový záznam:

1. Kontrola duplicity (`source_url`)
2. **AI zpracování** (OpenAI) → titulek, excerpt, HTML obsah, rubrika, úroveň přístupu, kategorie
3. Publikace do `articles` (autor = první admin)

### Ruční spuštění (doporučeno poprvé)

1. Admin → **AI ingestion**
2. Klik **Start ingestion**
3. Po ~1–3 min → **Articles** / homepage

Bez `OPENAI_API_KEY` běží **fallback režim** (metadata + odkaz na zdroj).

### Automatický cron (každých 6 h)

**Lokálně** (test):

```bash
curl "http://localhost:3000/api/cron/ingest?secret=VÁŠ_CRON_SECRET"
```

**Vercel** — soubor `vercel.json` už obsahuje cron. Po deployi nastavte v projektu env `CRON_SECRET`; Vercel posílá hlavičku `Authorization: Bearer ...`.

V adminu **AI ingestion** lze upravit:

- zapnout/vypnout automatiku
- interval (hodiny)
- max článků na běh (výchozí 24)

---

## Fáze 5 — Ověření funkčnosti

| Kontrola | URL / akce |
|----------|------------|
| Magazín | `/` — články po ingestu |
| Kategorie | `/category/cardiology` atd. |
| Úrovně přístupu | Registrace student/physician → viditelnost článků |
| VIP paywall | `/account`, VIP články |
| Landing | `/welcome`, `/pricing` |
| i18n | Přepínač jazyka v hlavičce |
| Ingestion log | `/admin/ingestion` |
| Build | `npm run build:win` (Windows) |

---

## Fáze 6 — Produkce (Vercel)

1. Repo na GitHub → Import do Vercel.
2. Nastavte všechny env z `.env.example`.
3. Production URL → Supabase redirect URLs.
4. Spusťte migrace na **produkčním** Supabase projektu.
5. Deploy → cron začne volat `/api/cron/ingest`.

---

## Zdroje podle kategorie (úprava)

Soubor: `lib/ingestion/sources.ts`

- `GLOBAL_RSS_SOURCES` — světové feedy
- `PUBMED_BY_CATEGORY` — dotazy PubMed per obor

Po úpravě znovu spusťte ingestion z adminu.

---

## Co bude další fáze (viz ROADMAP.md)

- Stripe předplatné (149 / 499 / 2490 CZK)
- AI Advertising Engine (plný workflow + platby)
- Ověření lékaře (upload diplomu)
- Všech 16 jazyků obsahu
- Playwright testy

---

## Řešení problémů

| Problém | Řešení |
|---------|--------|
| Žádné články po ingestu | Spusťte migraci 002+003, seed-medical.sql, musí existovat admin |
| `column min_access_level does not exist` | Spusťte migraci 001 + 002 |
| OpenAI chyba | Zkontrolujte klíč a kredit; fallback stále vloží články |
| Build EISDIR na `D:\` | `npm run build:win` nebo přesun na `C:\` |
| Cron 401 | Shoda `CRON_SECRET` v URL/env |

Podpora konfigurace: `README.md`, `docs/ROADMAP.md`
