# MeDiktor onboarding — apply SQL na produkční Supabase

## Stav ověření (agent, 2026-08-11)

| Check | Výsledek |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` v `marketing-hub-deploy/.env.local` | project ref **`xcydgqnivxfhprbmdyym`** — **shoda** |
| Migrace v gitu / disku | `supabase/migrations/20260811210000_mediktor_onboarding.sql` (147 řádků) |
| Aplikace na produkci | **neověřeno** — po ručním běhu vždy spusť VERIFY SQL níže |

> Nepředpokládej úspěch jen proto, že někdo „spustil SQL“. Bez VERIFY výsledků jsou tabulky stále považované za chybějící.

## Správný soubor (ověř před spuštěním)

- **Cesta:** `marketing-hub-deploy/supabase/migrations/20260811210000_mediktor_onboarding.sql`
- **První řádek:** `-- MeDiktor physician onboarding: OTP challenges, doctor verification, SW integrations`
- **Poslední řádek:** `'Ambulatory/hospital SW connector settings for MeDiktor dictation export';`
- **Celkem:** 147 řádků

Soubor vytváří (mimo jiné):

- tabulky `mediktor_otp_challenges`, `mediktor_doctor_verifications`, `mediktor_integrations`, `mediktor_integration_deliveries`
- sloupce na `public.users`: `phone`, `mediktor_onboarding_completed`, `mediktor_verification_status`

## Kam kliknout (produkce)

1. Otevři přesně tento projekt:
   **https://supabase.com/dashboard/project/xcydgqnivxfhprbmdyym**
2. Vlevo nahoře zkontroluj, že jsi v projektu **`xcydgqnivxfhprbmdyym`** (ne staging / jiný MedScope projekt).
3. Vlevo: **SQL** → **SQL Editor** → **New query**.
   Přímý odkaz:
   **https://supabase.com/dashboard/project/xcydgqnivxfhprbmdyym/sql/new**
4. Otevři lokálně soubor výše, zkopíruj **celý** obsah (Ctrl+A → Ctrl+C).
5. Vlož do editoru → **Run** (Ctrl+Enter).
6. Úspěch běhu: zelená / Success, žádný error.
   (`IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` jsou idempotentní — opakovaný běh je OK.)

## VERIFY SQL (povinné po Run)

Spusť v novém query na **stejném** projektu:

```sql
-- 1) Tabulka musí existovat → očekávej: public.mediktor_otp_challenges
SELECT to_regclass('public.mediktor_otp_challenges');

-- 2) Volitelně všechny mediktor tabulky
SELECT to_regclass('public.mediktor_otp_challenges') AS otp,
       to_regclass('public.mediktor_doctor_verifications') AS doctor_verifications,
       to_regclass('public.mediktor_integrations') AS integrations,
       to_regclass('public.mediktor_integration_deliveries') AS deliveries;

-- 3) Sloupce na public.users → očekávej 3 řádky
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name IN (
    'phone',
    'mediktor_onboarding_completed',
    'mediktor_verification_status'
  )
ORDER BY column_name;
```

### Jak vypadá úspěch

| Query | Úspěch | Neúspěch |
| --- | --- | --- |
| `to_regclass('public.mediktor_otp_challenges')` | `public.mediktor_otp_challenges` | `null` |
| sloupce na `users` | 3 řádky: `mediktor_onboarding_completed`, `mediktor_verification_status`, `phone` | 0–2 řádky |

Pokud je výsledek `null` / chybí sloupce → SQL neběžel na tomto projektu (špatný projekt, neuložený Run, nebo jiný soubor). Znovu zkontroluj URL s `xcydgqnivxfhprbmdyym` a spusť migraci znovu.
