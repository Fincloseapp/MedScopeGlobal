# MedScopeGlobal V4c

## Moduly

- `/studie` — PubMed + univerzity + SÚKL (denní cron)
- `/leky/novinky` — EMA, FDA, SÚKL
- `/legislativa` — MZČR, SÚKL, ÚZIS, EU, DRG, kódy, úhrady
- `/digital-health` — eHealth + AI health
- `/novinky` — univerzity CZ/EU/svět
- `/newsletter` — generování 2× měsíčně
- `/dokumentace/v4a|v4b|v4c`

## Cron

```bash
GET /api/cron/v4c-daily?secret=$CRON_SECRET
GET /api/cron/newsletter-generate?secret=$CRON_SECRET
```

## Migrace

`supabase/migrations/20260605120000_v4c_content_modules.sql`
