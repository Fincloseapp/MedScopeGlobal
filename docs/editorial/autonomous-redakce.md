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
| `editorial-images` | 10:00 | Vizuální redakce — hero obrázky, alt text, compliance |
| `syndicate-articles` | 14:00 | Plán syndikace mezi locale |
| `generate-articles` | 06:00 | LLM + editorial review |

Endpoint: `POST /api/ecosystem/autonomous` (Bearer `CRON_SECRET`)  
Obrázky: `POST /api/ecosystem/editorial/images` (Bearer `CRON_SECRET`)

## Vizuální redakce (obrázky)

Autonomní pipeline vybírá ilustrační hero obrázky k článkům podle tématu (longevity, lifestyle, seniors, trending).

### Persony

| Role | Úloha |
|------|-------|
| **image_curator** | Vybírá inclusive, legálně compliant imagery; generuje alt text CS+EN |

Persony: `image-curator-global`, `image-curator-cz` — viz `lib/ecosystem/editorial/personas.ts`

### Pravidla (policy)

- **Zamítnuto:** politika, násilí, stereotypy, zavádějící health claims
- **Priorita:** longevity, zdravý životní styl, senioři — globálně přijatelné, rasově inclusive
- **Zdroje:** kurátorovaný Unsplash pool, volitelně `UNSPLASH_ACCESS_KEY`, SVG fallback z `/assets/affiliate/`
- **Bez AI generování** — scaffold pro budoucí AI provider

Konfigurace: `lib/ecosystem/editorial/images/` (`policy.ts`, `matcher.ts`, `sources.ts`, `processor.ts`)

### Backfill existujících článků

```bash
# Dry-run (default) — vypíše kandidáty bez zápisu
node scripts/editorial/backfill-article-images.mjs

# Zápis cover_image_url + metadata alt text (service role)
node scripts/editorial/backfill-article-images.mjs --apply --limit=20
```

### UI integrace

- Hero `alt` z `metadata.hero_alt_text_cs/en` nebo generovaný fallback
- Jemný CTA pod hero: `ArticleImageSupportNudge` → tringelt / VIP (nepřímý, nenásilný)

Komponenty: `components/monetization/article-image-support-nudge.tsx`

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

Soubor: `supabase/migrations/20260825230000_editorial_images.sql`

- `article_image_suggestions` — navržené hero URL, alt text CS/EN, compliance, `applied_at`
- `editorial_queue.task_type` — `article` | `image` | `syndication`

## Související soubory

```
lib/ecosystem/editorial/
  desks.ts, personas.ts, syndication.ts, compliance.ts, index.ts
  images/ — policy, prompts, matcher, sources, processor, alt-text
lib/ecosystem/monetization.ts  — ARTICLE_TIP_TIERS
lib/ecosystem/autonomous.ts    — editorial-queue, editorial-images, syndicate-articles
app/api/ecosystem/article-tip/route.ts
app/api/ecosystem/editorial/desks/route.ts
app/api/ecosystem/editorial/images/route.ts
components/monetization/article-tringelt-tip.tsx
components/monetization/article-image-support-nudge.tsx
scripts/editorial/backfill-article-images.mjs
```
