# AI Engine v18 — Load Test Report

**Datum:** 2026-06-07T22:27:48 UTC  
**Cíl:** https://www.medscopeglobal.com  
**Nástroj:** Node.js staged RPS runner (k6-compatible profil; projekt bez k6/autocannon)  
**Profil:** 0→50 RPS / 30s · 50 RPS / 60s · ramp-down 20s (110s celkem na test)

## Executive summary

- **Mixed error rate:** 72.31% (cíl < 2%)
- **Upload p95:** 12373 ms (cíl < 1500 ms)
- **LLM endpointy:** latence výrazně nad specifikovanými cíli (viz tabulka) — očekávané u GROQ inference na serverless

## Výsledková tabulka

| Test | Plánované req | Dokončené | Ø latence | p95 | p99 | RPS (skutečné) | Error rate | Timeouty | Fallback % | Splněno |
|------|---------------|-----------|-----------|-----|-----|----------------|------------|----------|------------|---------|
| upload | 4254 | 4189 | 4984 ms | 12373 ms | 21342 ms | 14.92 | 1.53% | 4 | 0% | FAIL |
| summarize | 4254 | 4254 | 17733 ms | 18680 ms | 18857 ms | 15.37 | 92.08% | 0 | 54.6% | FAIL |
| guideline | 4254 | 4253 | 18457 ms | 18688 ms | 18864 ms | 11.26 | 97.91% | 1 | 97.75% | FAIL |
| clinical-check | 4254 | 4254 | 18418 ms | 18678 ms | 18852 ms | 14.95 | 97.77% | 0 | 98.95% | FAIL |
| mixed | 4254 | 4254 | 13839 ms | 18677 ms | 18846 ms | 19.18 | 72.31% | 0 | 100% | FAIL |

## Latence — ASCII grafy (p95 po testu)

### upload
```
p95=12373ms  p99=21342ms  max=30005.71669999996ms
dist (500ms buckets): ▁▁▁▁▄█▇▄▃▃▂▂▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
```

### summarize
```
p95=18680ms  p99=18857ms  max=19930.098800000007ms
dist (500ms buckets): ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█▁▁▁
```

### guideline
```
p95=18688ms  p99=18864ms  max=120004.40809999997ms
dist (500ms buckets): ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
```

### clinical-check
```
p95=18678ms  p99=18852ms  max=19409.140999999974ms
dist (500ms buckets): ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█▁▁
```

### mixed
```
p95=18677ms  p99=18846ms  max=19357.237400000013ms
dist (500ms buckets): ▁▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█▁▁
```

## Throughput (RPS) — cílový profil

```
target RPS: ▁▁▁▂▂▃▃▃▄▄▅▅▆▆▆▇▇██████████████████████████████████▇▆▆▅▄▄▃▂▂▁▁
max target: 50 RPS
```

- **upload:** skutečné RPS 14.92 (plán až 50 RPS)
- **summarize:** skutečné RPS 15.37 (plán až 50 RPS)
- **guideline:** skutečné RPS 11.26 (plán až 50 RPS)
- **clinical-check:** skutečné RPS 14.95 (plán až 50 RPS)
- **mixed:** skutečné RPS 19.18 (plán až 50 RPS)

## Fallback statistiky (model z API odpovědi)

| Test | primary | mixtral | gemma2 | other | fallback rate |
|------|---------|---------|--------|-------|---------------|
| upload | 0 | 0 | 0 | 0 | 0% |
| summarize | 153 | 88 | 96 | 0 | 54.6% |
| guideline | 2 | 46 | 41 | 0 | 97.75% |
| clinical-check | 1 | 56 | 38 | 0 | 98.95% |
| mixed | 0 | 54 | 45 | 0 | 100% |

## Dokumenty (upload)

- Průměrná velikost uploadu: **204800 B**
- Testovací PDF: **204800 B**

## CPU / RAM

Metriky hostitele (Vercel serverless) nejsou z externího load testu dostupné. Pro produkční observabilitu doporučujeme Vercel Analytics / Datadog APM.

Snapshot `/api/v18/monitoring` (statické placeholdery):
```json
{
  "requestsLastHour": 0,
  "avgLatencyMs": 0,
  "errorRate": 0,
  "auditWritesLastHour": 0
}
```

## Analýza chyb

### upload
- HTTP status breakdown: {"error":20}
- Příklad: `fetch failed…`

### summarize
- HTTP status breakdown: {"500":20}
- GROQ TPM rate limit: **19** z 3917 chyb
- Příklad: `request failed…`

### guideline
- HTTP status breakdown: {"500":20}
- GROQ TPM rate limit: **20** z 4165 chyb
- Příklad: `[Groq] openai/gpt-oss-20b: {"error":{"message":"Rate limit reached for model `openai/gpt-oss-20b` in organization `org_0…`

### clinical-check
- HTTP status breakdown: {"500":20}
- GROQ TPM rate limit: **20** z 4159 chyb
- Příklad: `[Groq] openai/gpt-oss-20b: {"error":{"message":"Rate limit reached for model `openai/gpt-oss-20b` in organization `org_0…`

### mixed
- HTTP status breakdown: {"500":20}
- GROQ TPM rate limit: **20** z 3076 chyb
- Příklad: `[Groq] openai/gpt-oss-20b: {"error":{"message":"Rate limit reached for model `openai/gpt-oss-20b` in organization `org_0…`

## Doporučení pro optimalizaci

1. **Oddělit latenci od throughputu** — LLM inference (2–15 s) nesplní p95 < 500–800 ms; cíle přizpůsobit SLA inference vrstvě, ne HTTP edge.
2. **Rate limiting / fronta** — při 50 RPS na GROQ zavést job queue (Temporal / Supabase queue) a async polling pro klienty.
3. **Caching** — krátké dotazy (guideline šablony) cacheovat v Redis/Edge s TTL 5–15 min.
4. **Upload** — udržet extrakci mimo cold start (warm pool, `serverExternalPackages` již nastaveno).
5. **Fallback chain** — monitorovat `model` v audit logu; při vysokém fallback % zkontrolovat GROQ kvóty a primární model.
6. **Concurrency cap** — Vercel `maxDuration` 120s; omezit souběžné inference na úrovni API (token bucket per IP/user).
7. **Monitoring** — doplnit reálné metriky do `getV18MonitoringSnapshot()` z `v17_audit_logs` / Vercel logs.

---
*Generováno: 2026-06-07T22:27:48.277Z → 2026-06-07T22:27:48.690Z*