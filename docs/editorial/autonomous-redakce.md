# Autonomní redakce (Editorial System)

MedScopeGlobal provozuje autonomní redakční systém s locale-specific desks, profesionálními personami a syndikací obsahu napříč trhy.

## Redakční stoly (Desks)

Každý locale má redakční stůl s váhami témat:

| Téma | Váha | Popis |
|------|------|-------|
| **longevity** | 40 % | Dlouhověkost — prioritní podíl obsahu |
| **lifestyle** | 25 % | Zdravý životní styl |
| **seniors** | 20 % | Zdraví pro seniory |
| **trending** | 15 % | Aktuální zdravotní zprávy |

Hub stoly (`cs`, `en-US`, `en`) syndikují obsah do ostatních locale. Konfigurace: `lib/ecosystem/editorial/desks.ts`.

Veřejné API: `GET /api/ecosystem/editorial/desks?locale=cs`

## Persony a role

Autonomní redakční persony mají čtyři role:

| Role | Úloha |
|------|-------|
| **journalist** | Píše články podle tématu a locale |
| **editor** | Reviduje obsah, schvaluje publikaci |
| **language_reviewer** | Jazyková QA (gramatika, terminologie) |
| **compliance_reviewer** | Lékařské disclaimery, guardrails pro health claims |

Konfigurace: `lib/ecosystem/editorial/personas.ts`

## Syndikace

Syndikace ≠ slepá duplikace. Podporované módy:

- **adapted_translation** — kulturně adaptovaný překlad (CS → SK, EN → DE)
- **summary_adaptation** — zkrácená adaptace pro jiný trh
- **cross_reference** — odkaz na originál s lokálním komentářem
- **original** — pouze v originálním locale

Pravidla: `lib/ecosystem/editorial/syndication.ts`  
DB tracking: tabulka `article_syndications`

## Compliance

Guardrails pro autonomní generování:

- Blokovaná témata (miracle claims, diagnosis without disclaimer)
- Povinný medical disclaimer per locale (`MEDICAL_DISCLAIMER`)
- VIP CTA šablony — čtenáře směřují k longevity protokolům

Konfigurace: `lib/ecosystem/editorial/compliance.ts`

## Autonomní cron

| Task | Cron | Popis |
|------|------|-------|
| `editorial-queue` | 05:00 | Fronta redakčních úkolů per desk |
| `syndicate-articles` | 14:00 | Plán syndikace mezi locale |
| `generate-articles` | 06:00 | LLM + editorial review |

Endpoint: `POST /api/ecosystem/autonomous` (Bearer `CRON_SECRET`)

## Tringelt (tip) monetizace

Volitelný mikro-příspěvek per článek — jako spropitné v restauraci.

### Preset tier tabulka

| Locale | Měna | Presety (minor units) | Zobrazení | Minimum |
|--------|------|----------------------|-----------|---------|
| cs | CZK | 200, 500, 1000, 2000, 5000 | 2, 5, 10, 20, 50 Kč | 2 Kč |
| sk, de, fr, it, es | EUR | 10, 25, 50, 100, 250 | 0,10–2,50 € | 0,10 € |
| en, en-US | USD | 10, 25, 50, 100, 250 | $0,10–$2,50 | $0,10 |
| pl | PLN | 100, 250, 500, 1000, 2500 | 1–25 zł | 1 zł |

Platby: `POST /api/ecosystem/article-tip` → Stripe Checkout → `v27_orders` (`kind: article_tip`)

UI: `components/monetization/article-tringelt-tip.tsx` na stránce článku.

Bez Stripe klíčů: komponenta zobrazí disabled stav (503).

## Migrace

Soubor: `supabase/migrations/20260825220000_editorial_redakce.sql`

- `article_syndications` — cross-locale adoption
- `editorial_queue` — cron pipeline scaffold
- Index `idx_v27_orders_article_tip` — tipy per slug

## Související soubory

```
lib/ecosystem/editorial/
  desks.ts, personas.ts, syndication.ts, compliance.ts, index.ts
lib/ecosystem/monetization.ts  — ARTICLE_TIP_TIERS
lib/ecosystem/autonomous.ts    — editorial-queue, syndicate-articles
app/api/ecosystem/article-tip/route.ts
app/api/ecosystem/editorial/desks/route.ts
components/monetization/article-tringelt-tip.tsx
```
