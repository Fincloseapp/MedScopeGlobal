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

Config targets (`lib/v25/writers/writer-base.mjs`): min **1100**, target **1400** words; prompts request 1200–1500 in v26.3.

## By generation path

| Path | Count | Avg words | Min | Max | % &lt;300 | % &lt;800 |
|------|------:|----------:|----:|----:|-------:|-------:|
| public-cron+deterministic-depth | 15 | 1369 | 828 | 1576 | 0% | 0% |
| public-articles-cron | 4 | 1239 | 1178 | 1340 | 0% | 0% |
| seed-static | 4 | 231 | 111 | 580 | 75% | 100% |
| v19-brief-ingest / foreign | 3 | 95 | 13 | 137 | 100% | 100% |

### Path definitions

- **public-articles-cron** — LLM draft from v25 writers; structure validated; expansion pass if short.
- **public-cron+deterministic-depth** — Cron output where `appendMagazineDepthSections()` padded length (markers: „Týdenní plán v české praxi“, „Mini-příručka na nákup“). Hits word count but sections can feel templated.
- **seed-static** — `seed-public-articles.ts` / demo seeds without date suffix; **45–71 words** in source files.
- **v19-brief-ingest / foreign** — Non-`verejnost-*` slugs (MZČR news, ACEP Delphi PDF summaries); **13–137 words** — not magazine depth.

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

These remain in the live feed alongside long cron articles → drags down perceived quality.

## Worst offenders (shortest live URLs)

| Words | Path | Slug | Sample URL |
|------:|------|------|------------|
| 13 | foreign-ingest | `unscheduled-procedural-sedation-…` | https://medscopeglobal.com/article/unscheduled-procedural-sedation-multidisciplinary-delphi-consensus-guidelines-part-1-principles-oversight-and-quality-monitoring-approved-by-the-acep-board-of-directors-april-29-2026 |
| 111 | seed-static | `verejnost-prevence-screening-a-ockovani` | https://medscopeglobal.com/article/verejnost-prevence-screening-a-ockovani |
| 111 | seed-static | `verejnost-rozhovor-kardiolog-prevence-srdce` | https://medscopeglobal.com/article/verejnost-rozhovor-kardiolog-prevence-srdce |
| 123 | seed-static | `verejnost-nemoci-kdy-vyhledat-lekare` | https://medscopeglobal.com/article/verejnost-nemoci-kdy-vyhledat-lekare |
| 136 | v19-brief | `ministerstvo-zdravotnictv-zmnilo-3-vzvu-npo` | https://medscopeglobal.com/article/ministerstvo-zdravotnictv-zmnilo-3-vzvu-npo |
| 137 | v19-brief | `konference-nikez-2026-bude-online-registrace-sputna` | https://medscopeglobal.com/article/konference-nikez-2026-bude-online-registrace-sputna |
| 580 | seed-static | `verejnost-zivotni-styl-vyziva-bez-extremu` | https://medscopeglobal.com/article/verejnost-zivotni-styl-vyziva-bez-extremu |
| 828 | cron+depth | `verejnost-prevence-2026-08-14-ochrana-pred-rakovinou-…` | https://medscopeglobal.com/article/verejnost-prevence-2026-08-14-ochrana-pred-rakovinou-co-je-dostupne-v-cesku |

## Best examples (cron, ≥1178 words)

- https://medscopeglobal.com/article/verejnost-prevence-2026-07-25-biomarkery-zdravi-glukoza-lipidy-a-vitamin-d-co-si-nechat-vysvetlit-u-lekare (~1237w)
- https://medscopeglobal.com/article/verejnost-zivotni-styl-2026-07-28-jak-stres-z-prace-ovlivnuje-imunitu-role-dechove-cviceni-a-rezimu-dne (~1200w)

## Root cause analysis

### 1. Seed/demo cards in production mix (primary UX issue)

Static seeds (~50–120 words) are **not** expanded on insert. They appear on `/articles` next to 1200+ word cron pieces. Readers hitting a seed first perceive “all articles are tiny.”

**Fix direction:** Expand seeds to 800+ words, or hide seeds when ≥N cron articles exist; run `regenerate-short-public.mjs` on seed slugs.

### 2. v19 / foreign ingest leaks into public magazine feed

Short MZČR press releases and English Delphi summaries (13–137 words) pass listing filters. These are **ingest/brief** paths, not v25 magazine writers.

**Fix direction:** Exclude `rubric_slug=aktualni-zpravy` and non-Czech slugs from `getLatestArticles()` public desk; gate briefs to `/aktualni-zpravy` only.

### 3. Persona fallback when LLM fails

`buildPersonaFallbackHtml()` + `buildCompactPrompts()` (Groq 8b / 413 recovery) produce **~150–350 word** templates. `expandPublicArticleIfShort` should run after, but rate limits → deterministic depth only.

**Fix direction:** Fail closed (do not publish) below 800 words; queue for retry; prefer OpenAI/Gemini for expansion.

### 4. Deterministic depth ≠ editorial quality

15/19 cron articles used injected sections to reach 1100+ words. Word count target is met; **tip/contribution CTA** needs richer unique body, not repeated „Týdenní plán v české praxi“ blocks.

**Fix direction:** Tighten expansion prompt; reject articles where &gt;30% of words come from `appendMagazineDepthSections` boilerplate.

### 5. editorial_queue not the bottleneck

Queue cron enqueues tasks but most published Czech lay content is **v25 public-articles cron**. Queue length audit requires Supabase `editorial_queue` + `articles` join (not available in this run).

## Tooling

```bash
# Full audit (Supabase when creds valid, else production scrape)
pnpm audit:article-length

# JSON output
node scripts/editorial/audit-article-length.mjs --json

# Regenerate short public rows
node scripts/regenerate-short-public.mjs --min-words=1100 --expand --limit=30
```

## Next steps (expansion track — separate PR)

1. Regenerate all `seed-static` and sub-800 cron rows.
2. Listing filter: magazine desk = `verejnost-*` dated cron + expanded seeds only.
3. Unify `PUBLIC_ARTICLE_MIN_WORDS` (1100 in writer-base; prompts say 800–1500).
4. Quality gate before publish: min words + max boilerplate ratio + `shouldHideFromPublicListing`.
