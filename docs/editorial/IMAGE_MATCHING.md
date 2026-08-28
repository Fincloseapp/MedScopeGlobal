# Editorial image matching

How MedScopeGlobal picks hero/cover images for published articles so titles like **Středomořský talíř** get **food** photography—not clinical stock, doctor-on-phone, or brain imagery.

## Architecture (single source of truth)

All cover resolution flows through `lib/ecosystem/editorial/images/cover.ts`:

| Consumer | Entry point |
|----------|-------------|
| Article page / OG meta | `resolveArticleCoverUrl()` |
| Veřejnost listings | `resolveVerejnostCoverUrl()` → wrapper |
| Editorial backfill / cron | `matchImageForArticle()` in `matcher.ts` |
| Compliance (brain-cover-ban) | `validateVisualTopicMatch()` in `policy.ts` |

The editorial **image curator** persona (`image-curator-global`) runs the batch pipeline in `processor.ts`, persisting rows to `article_image_suggestions` and optionally updating `articles.cover_image_url`.

## 100% topic matching — how it works

### Step 1 — Classify visual topic from text

`classifyCoverTopic()` scans **title + slug + excerpt + public_topic** with ordered regex buckets:

1. **sleep** — spánek, únava, odpočinek…
2. **calm** — stres, mindfulness…
3. **food** — talíř, středomořský, strava, **výživa**, jídlo, **bílkoviny**/protein, potraviny…
4. **movement** — pohyb, cvičení…
5. **seniors** — senior, menopauza…
6. **walk** — děti, škola…
7. **vitals** — glukóza, tlak, cholesterol…
8. **tech** — telemedicína, wearable…
9. **research** — studie, biomarker, prevence…
10. **clinical** — nemoc, lékař, diagnóza…
11. Default → **research**

Food is detected **before** movement/seniors and clinical/research fallbacks so nutrition copy (e.g. bílkoviny + „síla“) never lands on gym, walk, or lab stock.

### Step 2 — Pick from the curated pool

`COVER_POOL` maps each visual topic to local WebP assets under `/assets/covers/`:

- `food` → `food.webp`, `food-2.webp`, … `produce.webp`
- `sleep` → `sleep.webp`, `calm-2.webp`
- `clinical` / `research` → clinical & science variants (blocked for food titles)

`pickCuratedCover(topic, seed)` hashes the slug/title for stable variety within the pool.

### Step 3 — Score & rank (editorial matcher)

`rankCuratedCandidates()` uses the **same pool** as step 2, boosted by `VISUAL_TOPIC_KEYWORDS` overlap with the article title.

### Step 4 — Compliance gate

`validateImageCompliance()` + `validateVisualTopicMatch()` enforce:

- **Global deny list** — `isDeniedEditorialImageUrl()` / `isDeniedStockUrl()` in `cover.ts`:
  brain-on-stick Unsplash ID (`photo-1576091160399`), doctor-phone v25 stock,
  dark-hands clinical, brain cross-section, and other blocked remote IDs
- Blocked political/violence URL patterns
- Min alt-text length (CS + EN)
- **Food articles** → must use `food*` or `produce` covers; **reject** `clinical`, `research`, `science`, `vitals`, `tech`
- **Sleep/calm** → reject clinical/brain paths

The deny list runs in **all write paths**:

| Path | Enforcement |
|------|-------------|
| `matcher.ts` | Skips denied URLs before scoring; Unsplash results filtered |
| `policy.ts` | `validateImageCompliance` + `validateVisualTopicMatch` |
| `processor.ts` | `applySuggestion` + `applyPendingEditorialImageSuggestions` re-validate |
| Backfill script | Uses `suggestImageForArticle` → same compliance gate |
| Cron `POST /api/ecosystem/editorial/images` | Batch + optional `applyPending: true` |

Shared helpers:

- `isDeniedEditorialImageUrl()` — policy wrapper for deny list (matcher, backfill, cron)
- `isClinicalOrBrainCoverUrl()` — clinical/lab/brain local paths
- `isFoodCoverUrl()` — food/produce paths only

### Step 5 — Stale stock replacement

`isStaleGenericStockUrl()` flags legacy v25 Supabase / remote Unsplash heroes. `resolveArticleCoverUrl()` swaps them for topic-matched local art even before backfill runs.

## Editorial desk topic vs visual topic

| Visual topic | Editorial desk topic (metadata) |
|--------------|----------------------------------|
| food, sleep, calm, movement, walk | lifestyle |
| seniors | seniors |
| clinical, research, tech, vitals | trending |

Stored in article metadata as `editorial_image_topic` and `editorial_image_visual_topic`.

## Autonomous redakce rules (image curator)

Persona `image-curator-global` (`lib/ecosystem/editorial/personas.ts`) runs on cron
`POST /api/ecosystem/editorial/images` (Bearer `CRON_SECRET`).

### What the cron does

1. Finds published articles with missing/stale heroes (`isMissingOrStaleHeroImage`)
2. Classifies visual topic (`classifyCoverTopic`) — same as article page
3. Ranks curated pool candidates (`rankCuratedCandidates`)
4. Runs compliance (`validateImageCompliance`) including **deny list**
5. Persists row to `article_image_suggestions`
6. When `apply: true` — writes `articles.cover_image_url` + alt metadata
7. When `applyPending: true` — applies compliant pending suggestion rows (re-validates policy)

### Deny list (never suggest or apply)

| Pattern | Reason |
|---------|--------|
| `photo-1576091160399` | brain-on-stick anatomy model |
| `doctor-phone` | overused v25 clinical stock |
| `/brain`, `brain-on-stick` | misleading neurology imagery |
| All `/v25-images/` paths | stale generic Supabase stock |
| Remote `images.unsplash.com` on articles | legacy mismatched heroes |

Lifestyle/food/sleep articles additionally reject local `clinical*`, `research*`, `science`, `vitals`, `tech` covers via `validateVisualTopicMatch`.

### Cron examples

```bash
# Status (GET, no auth in dev)
curl -s http://localhost:3000/api/ecosystem/editorial/images | jq

# Dry-run batch
curl -s -X POST http://localhost:3000/api/ecosystem/editorial/images \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"limit":20,"dryRun":true}'

# Apply new matches + pending compliant suggestions
curl -s -X POST http://localhost:3000/api/ecosystem/editorial/images \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"limit":50,"apply":true,"applyPending":true}'
```

## Image curator persona

Defined in `lib/ecosystem/editorial/personas.ts`:

- ID: `image-curator-global`
- Role: `image_curator`
- Cron: `POST /api/ecosystem/editorial/images` (see `AUTONOMOUS_SCHEDULE`)

## Database

Migration `20260825230000_editorial_images.sql` creates `article_image_suggestions` with compliance fields and `applied_at`.

## Running backfill

Requires `SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_URL` in `.env.local` or Cursor Secrets.

```bash
# Dry-run (default) — prints slug → suggested cover, no writes
node scripts/editorial/backfill-article-images.mjs

# Limit candidates
node scripts/editorial/backfill-article-images.mjs --limit=20

# Apply to DB (cover_image_url + metadata + suggestion row)
node scripts/editorial/backfill-article-images.mjs --apply

# Or via pnpm
pnpm exec tsx scripts/editorial/backfill-article-images-runner.ts
```

Pipeline status (no auth on GET in dev):

```bash
curl -s http://localhost:3000/api/ecosystem/editorial/images | jq
```

## Verification locally

```bash
pnpm exec tsx scripts/apps/functional-check.ts
pnpm typecheck
```

Functional checks include:

- Středomořský talíř → `food` visual topic + food cover
- Sleep longevity title → sleep/calm cover (not vitals)
- Clinical cover rejected for food title
- **brain-on-stick** and **doctor-phone** denied in `validateImageCompliance`
- Matcher never returns denied stock for food articles

## Coordination with brain-cover-ban

Both agents share:

- `classifyCoverTopic()` / `COVER_POOL` in `cover.ts`
- `isClinicalOrBrainCoverUrl()` in `cover.ts`
- `validateVisualTopicMatch()` in `policy.ts`

Display-time fallback (`resolveArticleCoverUrl`) and write-time backfill (`matchImageForArticle`) now use identical classification—fixes apply everywhere without duplicate logic.

## Czech food keyword reference

Wired in `FOOD_RE` (cover.ts) and `TOPIC_KEYWORDS.lifestyle` / `VISUAL_TOPIC_KEYWORDS.food` (matcher):

| Keyword | Category |
|---------|----------|
| středomořský / stredomorsk | food |
| talíř / talir | food |
| výživa / vyziv | food |
| strava, jídlo, kuchyně | food |
| potraviny, ovoce, zelenina | food |

Add new nutrition terms to **both** `FOOD_RE` in `cover.ts` and `VISUAL_TOPIC_KEYWORDS.food` to keep matcher and resolver aligned.
