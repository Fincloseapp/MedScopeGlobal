# MedScopeGlobal — Master Prompt (VitaScope Era)

Use this document when generating content, code, or marketing copy for the MedScopeGlobal ecosystem.

## Identity

**MedScopeGlobal** (`medscopeglobal.com`) is a global health platform hosting apps, Academy, and autonomous editorial.

**VitaScope** is the platform’s global health & longevity magazine:

- **Audience**: Everyone who wants better health, longer life, and a healthier lifestyle — all ages, aspiration-driven
- **Tone**: Evidence-based, warm, accessible; never diagnostic or miracle-cure
- **Languages**: EN-US primary for global; CS for Czech portal; 19+ locale path prefixes

Tagline: *See life clearly. Live it longer.*

## Ecosystem (always mention when describing the platform)

| Product | Role |
|---------|------|
| **VitaScope** | Magazine — longevity, lifestyle, news desks |
| **MediFlow** | Personal wellness journal (articles, symptoms, supplements) |
| **MeDipacient** | Patient messaging demo PWA |
| **MeDiprep** | Medical school prep / tests PWA — **legacy**, deprioritized in nav & homepage |
| **OrdiZapis** | Physician documentation PWA |
| **Academy** | Courses and certificates |
| **VIP** | Paid longevity protocols ($6.99/mo en-US) |

## Editorial direction

1. **Longevity (40%)** — healthy aging, protocols, sleep, metabolism, VIP teasers
2. **Lifestyle (25%)** — nutrition, movement, prevention, mental wellness
3. **Seniors (15%)** — caregiver-friendly, EU prevention framing
4. **Trends (20%)** — GLP-1, biohacking, study digests with disclaimers

Autonomous pipeline: LLM draft → editorial review → translate → SEO/JSON-LD → hero image suggestion → syndication.

Monetization on articles: display ads, VIP CTA, tringelt micro-tip, affiliate boxes, MediFlow save.

## Technical constraints

- Next.js 15 App Router, Supabase, Cloudflare Workers (OpenNext)
- Locale middleware must not break; path pattern `/{locale}/…`
- PWAs keep **MedScopeGlobal** / app names in manifests; magazine = VitaScope in portal chrome
- Medical disclaimer on all health content

## Homepage messaging (reference)

- Eyebrow: `VitaScope · powered by MedScopeGlobal` (EN) / `VitaScope · platforma MedScopeGlobal` (CS)
- Claim: Health, longevity & lifestyle — for everyone
- Badge: New ecosystem — MediFlow, VIP, autonomous editorial, 19 locales
- **App order (homepage)**: MediFlow → MeDipacient → OrdiZapis → MeDiprep (legacy last)
- **Do not lead** with přijímačky / LF prep in hero, services grid, or primary nav

## Do not

- Claim diagnosis, treatment, or guaranteed outcomes
- Replace physician-facing content tone with clickbait on `/lekari` routes
- Break standalone PWA shells or `AppOriginBar` → VitaScope home link

## Related docs

- `docs/brand/magazine-brand.md` — brand rationale and code map
- `docs/marketing/global-plan.md` — geo marketing and KPIs
- `docs/editorial/autonomous-redakce.md` — redakce + tringelt + images
- `AGENTS.md` — cloud agent dev/run instructions
