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
3. **movement** — pohyb, cvičení…
4. **seniors** — senior, menopauza…
5. **walk** — děti, škola…
6. **food** — talíř, středomořský, strava, **výživa**, jídlo, potraviny…
7. **vitals** — glukóza, tlak, cholesterol…
8. **tech** — telemedicína, wearable…
9. **research** — studie, biomarker, prevence…
10. **clinical** — nemoc, lékař, diagnóza…
11. Default → **research**

Food is detected **before** broad clinical/research fallbacks so nutrition copy never lands on lab stock.

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

- Blocked political/violence URL patterns
- Min alt-text length (CS + EN)
- **Food articles** → must use `food*` or `produce` covers; **reject** `clinical`, `research`, `science`, `vitals`, `tech`
- **Sleep/calm** → reject clinical/brain paths

Shared helpers:

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
