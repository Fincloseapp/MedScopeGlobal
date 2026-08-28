# Article length audit — Czech public articles

Generated: 2026-08-28  
Data source: **production-scrape** (`https://medscopeglobal.com`) — 26 unique slugs from `/articles`, `/verejnost/clanky`, `/cs`, `/`  
Supabase: service role unavailable in cloud agent env (`invalid_api_key`); re-run with real credentials: `pnpm audit:article-length`

## How articles are stored

| Layer | Location | Notes |
|-------|----------|-------|
| Primary DB | Supabase `articles` | `content` (HTML), `audience`, `locale`, `rubric_slug`, `metadata`, `ai_generated`, `source_name` |
| Demo fallback | `lib/verejnost/demo-magazine-articles.ts` | In-memory when DB empty or Supabase unreachable |
| Seed (one-shot) | `lib/verejnost/seed-public-articles.ts` | `ensurePublicArticlesSeeded()` inserts static Czech cards |
| Daily generation | `cron/public/fetch-public-articles.mjs` → `lib/v25/writers/run-public-writers.mjs` | 5 writers, `audience=public`, slug `verejnost-{topic}-{date}-…` |
| Short-article repair | `scripts/regenerate-short-public.mjs` | Re-expands drafts under `PUBLIC_ARTICLE_MIN_WORDS` (1100) |
| Editorial queue | `editorial_queue` table + `/api/cron/ecosystem-editorial-queue` | Scaffold; most live Czech lay content is v25 cron, not queue output |
| Legacy ingest | `/api/cron/ingest`, v19 briefs | Short foreign/CZ news rows; `aktualni-zpravy` rubric, 45-day TTL |

Public listings (`/articles`, portal home) call `getLatestArticles()` → filter Czech + `audience=public` → mix with demo seeds when sparse.

## Summary statistics (production sample)

| Metric | Value |
|--------|------:|
| Articles analyzed | 26 |
| Min words | 13 |
| Avg words | 1027 |
| Median (p50) | 1259 |
| p75 | 1430 |
| Max words | 1576 |
| **Under 300 words** | **6 (23.1%)** |
| **Under 800 words** | **7 (26.9%)** |
| Under config min (1100) | 8 (30.8%) |

Config targets (`lib/v25/writers/writer-base.mjs`): min **1100**, target **1400** words; v26.3 prompts request 1200–1500.

## By generation path

| Path | Count | Avg words | Min | Max | % &lt;300 | % &lt;800 |
|------|------:|----------:|----:|----:|-------:|-------:|
| public-cron+deterministic-depth | 15 | 1369 | 828 | 1576 | 0% | 0% |
| public-articles-cron | 4 | 1239 | 1178 | 1340 | 0% | 0% |
| seed-static | 4 | 231 | 111 | 580 | 75% | 100% |
| v19-brief-ingest | 2 | 137 | 136 | 137 | 100% | 100% |
| foreign-ingest | 1 | 13 | 13 | 13 | 100% | 100% |

### Which paths produce short content?

| Path | Typical length | Root cause |
|------|---------------|------------|
| **seed-static / demo** | 45–120 words | Static HTML in seed files; never expanded |
| **v19-brief-ingest** | 130–200 words | Press-release ingest, not magazine writers |
| **foreign-ingest** | &lt;50 words | English Delphi/PDF summary stub |
| **persona-fallback** | 150–350 words | LLM failure → `buildPersonaFallbackHtml` (not seen in top-26 sample; likely unpublished or expanded) |
| **public-articles-cron** | 1178–1340 words | Working as designed when LLM + expansion succeed |
| **public-cron+deterministic-depth** | 828–1576 words | Word target met via `appendMagazineDepthSections` padding |
| **editorial-queue** | n/a in sample | Queue scaffold; not primary publisher yet |

## Demo / seed word counts (source files)

| Words | Slug |
|------:|------|
| 71 | `verejnost-zivotni-styl-zdravy-spanek` |
| 55 | `verejnost-prevence-screening-a-ockovani` |
| 47 | `verejnost-nemoci-kdy-vyhledat-lekare` |
| 55 | `verejnost-rozhovor-kardiolog-prevence-srdce` |
| 48 | `verejnost-zivotni-styl-vyziva-bez-extremu` |
| 48 | `demo-dlouhovekost-healthspan-zaklady` |
| 45 | `demo-novinky-prevence-v-cesku` |

## Worst offenders (shortest live URLs)

| Words | Path | Slug |
|------:|------|------|
| 13 | foreign-ingest | `unscheduled-procedural-sedation-…` |
| 111 | seed-static | `verejnost-prevence-screening-a-ockovani` |
| 111 | seed-static | `verejnost-rozhovor-kardiolog-prevence-srdce` |
| 123 | seed-static | `verejnost-nemoci-kdy-vyhledat-lekare` |
| 136 | v19-brief-ingest | `ministerstvo-zdravotnictv-zmnilo-3-vzvu-npo` |
| 137 | v19-brief-ingest | `konference-nikez-2026-bude-online-registrace-sputna` |
| 580 | seed-static | `verejnost-zivotni-styl-vyziva-bez-extremu` |
| 828 | public-cron+deterministic-depth | `verejnost-prevence-2026-08-14-ochrana-pred-rakovinou-…` |

Sample production URLs:

- Short seed: https://medscopeglobal.com/article/verejnost-prevence-screening-a-ockovani (~111w)
- Long cron: https://medscopeglobal.com/article/verejnost-prevence-2026-07-25-biomarkery-zdravi-glukoza-lipidy-a-vitamin-d-co-si-nechat-vysvetlit-u-lekare (~1237w)
- Foreign stub: https://medscopeglobal.com/article/unscheduled-procedural-sedation-multidisciplinary-delphi-consensus-guidelines-part-1-principles-oversight-and-quality-monitoring-approved-by-the-acep-board-of-directors-april-29-2026 (~13w)

## Root cause analysis

1. **Seed/demo cards in production mix** — Static seeds (~50–120 words) appear on `/articles` next to 1200+ word cron pieces. Readers hitting a seed first perceive “all articles are tiny.”

2. **v19 / foreign ingest in magazine feed** — Short MZČR releases and English Delphi summaries (13–137 words) pass listing filters. These are ingest/brief paths, not v25 magazine writers.

3. **Persona fallback when LLM fails** — `buildCompactPrompts()` + `buildPersonaFallbackHtml()` produce ~150–350 word templates. Expansion should follow, but rate limits leave short drafts or deterministic padding only.

4. **Deterministic depth ≠ editorial quality** — 15/19 cron articles used injected „Týdenní plán v české praxi“ sections. Word count target met; unique depth for tip/contribution CTAs still weak.

5. **editorial_queue not the bottleneck** — Most published Czech lay content is **v25 public-articles cron**. Full queue audit needs Supabase join on `editorial_queue`.

## Tooling

```bash
pnpm audit:article-length          # Supabase or production fallback + doc
node scripts/editorial/audit-article-length.mjs --json
node scripts/regenerate-short-public.mjs --min-words=1100 --expand --limit=30
```

## Recommended next steps (expansion PR)

1. Regenerate all `seed-static` slugs and sub-1100 cron rows.
2. Listing filter: magazine desk = dated `verejnost-*` cron + expanded seeds only; exclude brief ingest.
3. Fail closed below 800 words at publish time; queue retry instead of persona fallback publish.
4. Quality gate: min words + max boilerplate ratio before `published=true`.
