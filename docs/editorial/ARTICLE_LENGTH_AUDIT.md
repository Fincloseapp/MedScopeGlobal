# Article length audit — Czech public articles

Generated: 2026-08-28  
Data source: **production-scrape** + anon public slug index (`https://medscopeglobal.com`)  
Supabase service role: **invalid_api_key** in cloud — content expand blocked; see [`PC_ARTICLE_EXPAND_BACKFILL.md`](../deploy/PC_ARTICLE_EXPAND_BACKFILL.md).

Re-run: `pnpm audit:article-length`

## Summary

| Metric | Value |
|--------|------:|
| Unique public published scraped | **587** |
| ≥800 words | **206** |
| <800 words | **381** |
| Expanded this session | **0** |
| Short on live `/articles` + homepage | **0** |
| Food→clinical/brain cover mismatches | **0** |

### Short buckets (<800)

| Band | Count |
|------|------:|
| <300 | 43 |
| 300–499 | 187 |
| 500–699 | 127 |
| 700–799 | 24 |

## User-reported Mediterranean URL

| Slug | Live words | Cover |
|------|----------:|-------|
| `verejnost-zivotni-styl-2026-06-23-stredomorsky-talir-v-ceske-kuchyni-vyvazena-strava-bez-extremu` | **1322–1340** | `food-4.webp` |

Sibling Mediterranean variants on `/verejnost/clanky` are all ≥1160 words with food covers.

## Listing filter

`shouldHideFromPublicListing` hides **any** article with `0 < words < 800` (plus seeds/demos). Wired into `/articles`, homepage, and `listPublicArticles` (`/verejnost/clanky`).

## PC expand (381 short rows)

```powershell
cd D:\medscope.local
$env:MEDSCOPE_PROJECT_ROOT = "D:\medscope.local"
node scripts/regenerate-short-public.mjs --expand --min-words=800 --expand-target=1200 --limit=500
```

## Config

- Min/target: `lib/ecosystem/editorial/article-length.mjs` — **800** / **1400** (range 800–1500)
- Repair: `scripts/regenerate-short-public.mjs`
