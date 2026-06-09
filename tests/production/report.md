# MedScope Production Test Report

**Datum:** 2026-06-07T23:16:53 UTC  
**Cíl:** https://medscopeglobal.com / https://www.medscopeglobal.com  
**Výsledek:** FAIL (15 OK / 1 FAIL)

## Shrnutí

Produkce je funkční (doména, SSL, redirecty, API v19, obsahový engine, async queue), ale **homepage překračuje výkonový cíl 500 ms** z testovací lokality.

## Stav domény

| Test | Výsledek | Detail |
|------|----------|--------|
| apex-domain | OK | 200 in 2056ms |
| www-domain | OK | manual=200, final=200 1140ms |
| ssl-www.medscopeglobal.com | OK | Let's Encrypt, expires 77d |
| redirect-http-www→https | OK | HTTP 308 |

## Stav SSL

| Host | Issuer | Expirace (dny) |
|------|--------|----------------|
| medscopeglobal.com | Let's Encrypt | 77 |
| www.medscopeglobal.com | Let's Encrypt | 77 |

## Stav redirectů

- **redirect-http→https:** OK — HTTP 308
- **redirect-http-www→https:** OK — HTTP 308
- **redirect-trailing-slash:** OK — HTTP 308

## Stav API v19

- **api-v19-get:** OK — 3 articles in 486ms
- **api-v19-post-sync:** OK — generated=0 in 29298ms
- **api-v19-get:** OK — 3 articles in 623ms
- **async-queue:** OK — job 942baba2-cab0-459d-8834-63eed55cb302 completed

## Stav obsahového engine

- **content-dedup:** OK — no duplicates in GET sample
- **content-engine:** OK — 3 articles validated

## Async queue

- **async-queue:** OK

## Výkonové metriky

| Metrika | Hodnota | Cíl |
|---------|---------|-----|
| Homepage (www) | 1140 ms | < 500 ms |
| API GET /articles | 623 ms | < 800 ms |
| API POST sync | 29298 ms | — |
| /odborne/briefy | 618 ms | — |

## Stránka briefů

- OK: 200 in 618ms, ssr-cards=0, client-rendered feed (3 articles via API)
- Poznámka: client-rendered feed (3 articles via API)

## Mixed content

- Žádné mixed-content problémy nebyly detekovány v HTML odpovědi

## Nalezené problémy

- performance: homepage 1140ms > 500ms target
- perf-homepage: 1140ms > 500ms

## Doporučení

1. Sledujte latenci homepage z CDN edge — cíl 500 ms může být přísný pro cold start.
2. POST generování článků je LLM-bound (desítky sekund) — používejte `async: true` v produkci.
3. Prázdný feed briefů řeší denní cron `/api/cron/v19-daily-briefs`.
4. Opakujte test: `npm run test:prod`.

---
*Generováno automaticky tests/production/run-prod-tests.mjs*