# Affiliate catalog — plug real IDs for max revenue

Source of truth:

| Layer | File |
|-------|------|
| Product catalog (CS + EN labels) | `AFFILIATE_PRODUCTS` in `lib/ecosystem/monetization.ts` |
| Outbound 302 map | `AFFILIATE_REDIRECT_DESTINATIONS` in same file |
| Redirect route | `app/(public)/go/[slug]/route.ts` → **302** known / **404** unknown |
| Surfaces | `AffiliateStrip` (`/aplikace`, article sidebar), `TopLongevityProducts` (article footer) |

Do **not** put affiliate chrome on `PortalHome` — homepage is owned by the portal redesign stream. Prefer `/aplikace`, article sidebar rail, and in-article boxes.

## Current catalog (10 SKUs)

| id | CS | EN | Category | `/go` slugs (cs / en / en-US) |
|----|----|----|----------|-------------------------------|
| `magnesium-glycinate` | Magnesium glycinát | Magnesium Glycinate | supplements | `mg-cz` / `mg-en` / `mg-us` |
| `vitamin-d3-k2` | Vitamin D3 + K2 | Vitamin D3 + K2 | supplements | `d3k2-cz` / `d3k2-en` / `d3k2-us` |
| `omega-3-epa-dha` | Omega-3 EPA/DHA | Omega-3 EPA/DHA | supplements | `omega3-cz` / `omega3-en` / `omega3-us` |
| `creatine-monohydrate` | Kreatin monohydrát | Creatine Monohydrate | fitness | `creatine-cz` / `creatine-en` / `creatine-us` |
| `collagen-peptides` | Kolagenové peptidy | Collagen Peptides | longevity | `collagen-cz` / `collagen-en` / `collagen-us` |
| `nmn-nad` | NMN / NAD+ prekurzor | NMN / NAD+ Precursor | longevity | `nmn-cz` / `nmn-en` / `nmn-us` |
| `omega-3-test` | Omega-3 laboratorní test | Omega-3 Lab Test | lab-tests | `omega-cz` / `omega-en` / `omega-us` |
| `longevity-blood-panel` | Longevity krevní panel | Longevity Blood Panel | lab-tests | `labs-cz` / `labs-en` / `labs-us` |
| `sleep-tracker` | Chytrý sleep tracker | Smart Sleep Tracker | sleep | `sleep-cz` / `sleep-en` / `sleep-us` |
| `blood-pressure-monitor` | Tlakoměr na paži | Upper-Arm BP Monitor | longevity | `bp-cz` / `bp-en` / `bp-us` |

Friendly aliases (product id) also resolve for CZ Heureka search destinations.

## How redirects work

1. UI links to **relative** `/go/{slug}` (locale-specific in `affiliateUrl`).
2. `GET /go/[slug]` looks up `getAffiliateRedirectDestination(slug)`.
3. Hit → `NextResponse.redirect(url, 302)`.
4. Miss → JSON `{ error: "Unknown affiliate link" }` with **404**.

Smoke: `/go/mg-cz` → 302 Heureka; `/go/unknown-affiliate-slug` → 404.

## Plug real affiliate IDs (revenue checklist)

Placeholders live in `AFFILIATE_TAG_PLACEHOLDERS` and helpers `amazonSearch` / `heurekaSearch`.

### Amazon Associates (EN / en-US)

1. Enroll at [affiliate-program.amazon.com](https://affiliate-program.amazon.com/) (US) and/or Amazon Associates UK.
2. Create tracking tag(s), e.g. `medscope-20`.
3. In `lib/ecosystem/monetization.ts`, set:

```ts
export const AFFILIATE_TAG_PLACEHOLDERS = {
  amazon: "YOUR_REAL_TAG",
  heurekaPartnerId: "…",
} as const;
```

4. Prefer **ASIN deep links** over search for higher conversion:

```ts
"mg-us": "https://www.amazon.com/dp/B0EXAMPLE?tag=YOUR_REAL_TAG",
```

5. Keep one slug per locale so CTR analytics stay clean.

### Heureka Partner (CS)

1. Join [Heureka Partner / Marketplace affiliate](https://partner.heureka.cz/) (or equivalent CZ network: Affilbox, Dognet for shop deep-links).
2. Replace `heurekaSearch("…")` entries with the partner redirect URL that embeds your partner id:

```ts
"mg-cz": `https://www.heureka.cz/exit/r/{OFFER_ID}?partner=${AFFILIATE_TAG_PLACEHOLDERS.heurekaPartnerId}`,
```

Exact path depends on the partner dashboard — paste the generated link into `AFFILIATE_REDIRECT_DESTINATIONS` only; leave `/go/mg-cz` unchanged so existing content links keep working.

### Other networks (optional)

| Region | Typical networks |
|--------|------------------|
| CZ/SK | Heureka Partner, Affilbox, Dognet, Pilulka affiliate |
| EU | Amazon EU stores, Awin, CJ |
| US | Amazon Associates, ShareASale, Impact (labs / wearables) |

Add new slugs only in `AFFILIATE_REDIRECT_DESTINATIONS` + matching `affiliateUrl` on the product.

## Max-revenue practices

1. **Deep links > search** — product/ASIN pages convert better than keyword search.
2. **Locale-correct merchant** — CZ → Heureka/CZ shops; `en-US` → amazon.com; `en` → amazon.co.uk (or .de for DE later).
3. **Stable `/go` slugs** — never change public slugs; only swap destination URLs.
4. **Disclosure** — UI already marks Affiliate / Partnerství; keep `rel="sponsored"`.
5. **Placement** — article sidebar rail + apps catalog strip + in-article box; avoid hero / PortalHome.
6. **Measure** — log `/go/*` hits in analytics (path = slug) before optimizing creatives.
7. **Seasonality** — rotate strip `limit` / order in `getAffiliateStripProducts` toward high-margin SKUs (labs, wearables, NMN).

## Adding a product

1. Add SVG under `public/assets/affiliate/`.
2. Append to `AFFILIATE_PRODUCTS` with `cs` + `en` (+ optional `en-US`) labels.
3. Add `*-cz` / `*-en` / `*-us` keys to `AFFILIATE_REDIRECT_DESTINATIONS` (and optional product-id alias).
4. Update this table.
5. `pnpm typecheck` and curl `/go/{new-slug}` → 302.

## Related

- Display ads inventory (parallel stream): `docs/monetization/AD_INVENTORY.md` when present.
- Functional asserts: `scripts/apps/functional-check.ts` (`getAffiliateRedirectDestination`).
- Ecosystem smoke: `/go/magnesium` 302, `/go/unknown-affiliate-slug` 404.
