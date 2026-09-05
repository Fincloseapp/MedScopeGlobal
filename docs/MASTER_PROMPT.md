# MedScopeGlobal — Master Prompt (ViaLongeVita Era)

Use this document when generating content, code, or marketing copy for the MedScopeGlobal ecosystem.

## Identity

**MedScopeGlobal** (`medscopeglobal.com`) is a global health platform hosting apps, Academy, and autonomous editorial.

**ViaLongeVita** is the platform’s global health & longevity magazine (former name: VitaScope):

- **Audience**: Everyone who wants better health, longer life, and a healthier lifestyle — all ages, aspiration-driven
- **Tone**: Evidence-based, warm, accessible; never diagnostic or miracle-cure
- **Languages**: EN-US primary for global; CS for Czech portal; 19+ locale path prefixes

Tagline: *See life clearly. Live it longer.*

## Ecosystem (always mention when describing the platform)

| Product | Role |
|---------|------|
| **ViaLongeVita** | Magazine — longevity, lifestyle, news desks |
| **MediFlow** | Personal wellness journal (articles, symptoms, supplements) |
| **MeDipacient** | Patient messaging demo PWA |
| **MeDiprep** | Medical school prep / tests PWA — **legacy**, deprioritized in nav & homepage |
| **OrdiZapis** | Physician documentation PWA (Czech marketing alias **OrdiZáznam**, route `/ordizaznam`) |
| **Academy** | Courses and certificates |
| **VIP** | Paid longevity protocols ($6.99/mo en-US) |

## Editorial direction

1. **Longevity (40%)** — healthy aging, protocols, sleep, metabolism, VIP teasers
2. **Lifestyle (25%)** — nutrition, movement, prevention, mental wellness
3. **Seniors (15%)** — caregiver-friendly, EU prevention framing
4. **Trends (20%)** — GLP-1, biohacking, study digests with disclaimers

Autonomous pipeline: LLM draft → editorial review → translate → SEO/JSON-LD → hero image suggestion → syndication.

Monetization on articles: display ads, VIP CTA, tringelt micro-tip, affiliate boxes, MediFlow save.

### Monetization (operators)

| Channel | Status in code | Operator action |
|---------|----------------|-----------------|
| **VIP** | Stripe checkout `/vip/protokoly` | Live Stripe keys on Workers |
| **Tringelt** | `ArticleTringeltTip` + `/api/ecosystem/article-tip` | Same Stripe keys |
| **Donations** | `AuthorDonationButton` + `/api/ecosystem/donate` | Same Stripe keys |
| **Display ads** | `GlobalAdSlot` + Auto ads — owner `ca-pub-6820104998820692` | AdSense → then Mediavine; see setup doc |
| **Affiliate** | `/go/[slug]` + homepage/article boxes | Replace destinations with tagged links |
| **CMS / B2B ads** | `components/ads/*`, `/admin/ads` | Sales later |

Display ads use owner AdSense `ca-pub-6820104998820692` (Auto ads) on public magazine locales.
Disable with `NEXT_PUBLIC_ADS_ENABLED=false`. Physician / student / admin paths stay ad-free.

Operator runbooks:

- `docs/monetization/AD_ACCOUNTS_SETUP.md` — which accounts to create, priority for income
- `docs/monetization/AD_INVENTORY.md` — placements, sizes, density rules

## Technical constraints

- Next.js 15 App Router, Supabase, Cloudflare Workers (OpenNext)
- Locale middleware must not break; path pattern `/{locale}/…`
- PWAs keep **MedScopeGlobal** / app names in manifests; magazine = ViaLongeVita in portal chrome
- Medical disclaimer on all health content

## Homepage messaging (reference)

- Eyebrow: `ViaLongeVita · powered by MedScopeGlobal` (EN) / `ViaLongeVita · platforma MedScopeGlobal` (CS)
- Claim: Health, longevity & lifestyle — for everyone
- Badge: New ecosystem — MediFlow, VIP, autonomous editorial, 19 locales
- **App order (homepage)**: MediFlow → MeDipacient → OrdiZapis → MeDiprep (legacy last)
- **Do not lead** with přijímačky / LF prep in hero, services grid, or primary nav

## Do not

- Claim diagnosis, treatment, or guaranteed outcomes
- Replace physician-facing content tone with clickbait on `/lekari` routes
- Break standalone PWA shells or `AppOriginBar` → ViaLongeVita home link

## D: PC secrets / deploy (Windows only)

Cloud agents cannot read `D:\`. On the PC after `git pull`:

```powershell
cd D:\medscope.local
pnpm sync:d                 # restore:d + backup:d
pnpm restore:d -- -Deploy   # optional CF production deploy
```

| Script | Purpose |
|--------|---------|
| `pnpm sync:d` | One-shot restore env + dated backup under `D:\medscope.data\backups\` |
| `pnpm restore:d` | Merge CF/Supabase keys → `.env.local`, optional `gh secret set`, checklist |
| `pnpm backup:d` | Git bundle + env backup (never commit secrets) |
| `pnpm pull:d` | Pull cloud branch onto D: only (does not overwrite GitHub) |

Full runbook: `docs/deploy/RESTORE_FROM_D.md`. Production: `pnpm cf:deploy` (needs real CF tokens + non-placeholder `SUPABASE_SERVICE_ROLE_KEY`).

## Related docs

- `docs/deploy/RESTORE_FROM_D.md` — D: sync/backup/deploy runbook
- `docs/brand/magazine-brand.md` — brand rationale and code map
- `docs/marketing/global-plan.md` — geo marketing and KPIs
- `docs/editorial/autonomous-redakce.md` — redakce + tringelt + images
- `docs/monetization/AD_ACCOUNTS_SETUP.md` — AdSense / affiliates / Stripe accounts
- `docs/monetization/AD_INVENTORY.md` — ad placements and formats
- `AGENTS.md` — cloud agent dev/run instructions
