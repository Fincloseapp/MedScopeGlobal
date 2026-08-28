# Mediterranean article short-on-/cs — root cause & fix

**Slug:** `verejnost-zivotni-styl-2026-06-23-stredomorsky-talir-v-ceske-kuchyni-vyvazena-strava-bez-extremu`

**User URL:** https://medscopeglobal.com/cs/article/verejnost-zivotni-styl-2026-06-23-stredomorsky-talir-v-ceske-kuchyni-vyvazena-strava-bez-extremu

## Before (live scrape, 2026-08-28)

| Path | `article-prose` words | Notes |
|------|----------------------:|-------|
| `/cs/article/...` | **~83** (stub) | `polishCzechFields` replaced body |
| `/article/...` → `/en-us/...` | **~1340** | Full Czech longform (polish skipped) |

Stub text matched `buildTopicExcerpt()`: *„Konkrétní shrnutí zahraniční zprávy pro české lékaře…“* + *„Podrobnosti a primární data…“*.

## Why the length audit claimed ~800+ min for cron paths

`scripts/editorial/audit-article-length.mjs` scraped **`/article/{slug}`**, which redirects to **en-us** and skips `polishCzechFields`. The audit therefore counted the **full DB body** (~1300w), not the destroyed `/cs` render the user sees.

## Root cause (not missing DB content)

1. `articles.content` already holds professional Czech longform (~1280 words).
2. Cover is food (`/assets/covers/food-4.webp`). Contribution CTA present.
3. On `/cs`, `prepareArticleForDisplay` → `polishCzechFields` → `contentNeedsCzechTeaser()`.
4. `hasEnglishLeak()` matched a **single** byline token: `Editorial` inside `AI-Assisted Editorial Team`.
5. That flipped the body to a 2-paragraph foreign-news teaser.

## Fix (this branch)

- `lib/v22/translate.ts`: strip attribution noise; never teaser-replace Czech bodies ≥200 words unless EN-dominant.
- Audit: prefer `/cs/article/` when measuring production length.
- Regression in `scripts/apps/functional-check.ts`.

## DB update

**Not required** for this slug — content is already long. Valid `SUPABASE_SERVICE_ROLE_KEY` was unavailable (`Invalid API key`); regenerating other shorts still needs a rotated key on the PC:

```powershell
cd D:\medscope.local
pnpm restore:d   # refresh SUPABASE_SERVICE_ROLE_KEY
export MEDSCOPE_PROJECT_ROOT=D:\medscope.local   # or set in env
node scripts/regenerate-short-public.mjs --slug=verejnost-zivotni-styl-2026-06-23-stredomorsky-talir-v-ceske-kuchyni-vyvazena-strava-bez-extremu --expand-only --expand
```

## Deploy

Code fix must ship to Cloudflare Workers for `/cs` to show the longform. Content-only DB write would not have helped.

## Related seed

`verejnost-zivotni-styl-vyziva-bez-extremu` remains a seed card and stays hidden via `shouldHideFromPublicListing` / `isSeedOrDemoArticle`.
