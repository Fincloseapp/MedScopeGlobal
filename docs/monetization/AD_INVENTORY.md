# Display ad inventory

Source of truth: `AD_INVENTORY` in `lib/ecosystem/monetization.ts`.
Slots render via `GlobalAdSlot`. Auto ads use the owner publisher
`ca-pub-6820104998820692` (baked in). Manual `<ins>` units only when a numeric
slot env is set. Turn off with `NEXT_PUBLIC_ADS_ENABLED=false`.

```bash
NEXT_PUBLIC_ADS_ENABLED=true
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-6820104998820692
# optional later:
NEXT_PUBLIC_MEDIAVINE_SITE_ID=…
NEXT_PUBLIC_EZOIC_SITE_ID=…
```

Local layout preview only:

```bash
NEXT_PUBLIC_ADS_SHOW_PLACEHOLDERS=1
```

## Surfaces

### Homepage (`PortalHome`)

| ID | Placement | Formats | Priority |
|----|-----------|---------|----------|
| `home-mid` | `in-content` | 728×90, 970×90, 320×100, 300×250 | 1 |
| `home-footer` | `footer` | 728×90, 320×50, 300×250 | 2 |

Never in the hero. Mid sits after the magazine desk; footer before the closing CTA.

### Article detail (`/article/[slug]`)

| ID | Placement | Formats | Priority |
|----|-----------|---------|----------|
| `article-below-title` | `below-title` | 728×90, 320×100, 300×250 | 1 |
| `article-in-content` | `in-content` | 300×250, 336×280, responsive | 1 |
| `article-footer` | `footer` | 728×90, 300×250 | 2 |
| `article-sticky` | `sticky` | 320×50 / 320×100 | 3 (not mounted by default) |

Also on article pages (non-display):

- Tringelt tip → Stripe (`ArticleTringeltTip`)
- Author donation → Stripe (`AuthorDonationButton`)
- Affiliate products (`TopLongevityProducts` / `/go/*`)
- VIP nudge + MediFlow save
- First-party CMS ads (`AdSlot` / student campaigns) when DB rows exist

### App landings

| ID | Routes | Placement | Priority |
|----|--------|-----------|----------|
| `landing-mediflow` | `/mediflow` | below-fold `in-content` | 2 |
| `landing-medipacient` | `/medipacient` | below-fold `in-content` | 2 |
| `landing-ordizaznam` | `/ordizaznam` | below-fold `in-content` | 3 |

## Provider by region

| Region | Preferred order |
|--------|-----------------|
| USA | Mediavine → Ezoic → AdThrive → AdSense |
| EU | AdSense → Mediavine → Ezoic |
| RU | Yandex → AdSense |
| ASIA | Baidu → Naver → AdSense |
| GLOBAL | AdSense → native |

Resolved at runtime by `resolveAdProvider(locale)`.

## Density rules

1. Max one unit per placement id per page view.
2. No ads above the fold on marketing heroes.
3. No ads inside medical disclaimer copy.
4. VIP readers may continue to hide first-party homepage CMS ads (`HomepageAds`); display network policy TBD.
5. Physician landing (`/ordizaznam`) keeps lighter inventory.

Operator account steps: `docs/monetization/AD_ACCOUNTS_SETUP.md`.
