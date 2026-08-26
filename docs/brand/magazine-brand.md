# VitaScope — Magazine Brand

## Brand architecture

| Layer | Name | Role |
|-------|------|------|
| **Platform** | MedScopeGlobal | Domain, apps, billing, infra (`medscopeglobal.com`) |
| **Publication** | **VitaScope** | Global health & longevity magazine — editorial voice, SEO, syndication |

Tagline (EN): **See life clearly. Live it longer.**  
Tagline (CS): **Jasně o zdraví. Délka i kvalita života.**

## Why VitaScope

- **Vita** (life) — understood across geographies via Latin root
- **Scope** — ties to MedScopeGlobal; implies insight, perspective, evidence
- Short (8 letters), positive, aspirational — “scope out a better life”
- Works as a proper noun in all locales (no translation required)
- Signals longevity + wellness without clinical coldness

Alternatives considered: Longevita, WellSpan, ThriveLife, EverWell, VitaeVerse — VitaScope best balances memorability, platform coherence, and global EN-primary positioning.

## Editorial pillars

| Pillar | Share | Focus |
|--------|-------|-------|
| Longevity & healthy aging | 40% | Protocols, biomarkers, VIP content, seniors |
| Lifestyle & prevention | 25% | Nutrition, sleep, movement, mental wellness |
| Seniors & caregivers | 15% | Accessible framing, Czech/EU prevention tone |
| Trends & evidence | 20% | GLP-1, biohacking, study digests, disclaimers |

**Not a primary pillar:** Czech LF entrance-exam prep (MeDiprep). Keep routes working; list last in app catalog and secondary in nav/footer.

## Product prominence (homepage & nav)

1. VitaScope magazine + news desks  
2. MediFlow wellness journal  
3. VIP longevity protocols  
4. MeDipacient · OrdiZapis  
5. MeDiprep — legacy / student secondary (footer, `/studenti`, not hero)

## Autonomous redakce

- Cron hub: `/api/ecosystem/autonomous`
- Desks: Novinky, Veřejnost, Dlouhověkost, Články (+ global locale variants)
- Personas + syndication config: `lib/editorial/autonomous-config.ts`
- Image pipeline: hero suggestions, editorial-images cron, article page integration
- Safety: max articles/day, blocked topics, mandatory medical disclaimers, human review for en-US / ru / zh-CN

See also: `docs/editorial/autonomous-redakce.md`

## Monetization

| Channel | Notes |
|---------|-------|
| **VIP** | Longevity protocols — `$6.99/mo` en-US, localized Stripe |
| **Tringelt** | Micro-tip on articles — `ArticleTringeltTip`, `/api/ecosystem/article-tip` |
| **MediFlow** | Personal wellness journal — save articles, supplements, symptoms |
| **Display ads** | `GlobalAdSlot` by locale (Mediavine, AdSense, Yandex, …) |
| **Affiliate** | Tracked `/go` redirects, homepage affiliate sections |

## Production path

- **Deploy**: Cloudflare Workers via OpenNext (`pnpm cf:deploy`, `wrangler.jsonc`)
- **Domain**: `medscopeglobal.com/*`
- **CI**: `.github/workflows/cloudflare-deploy.yml` + Workers Builds dashboard
- **Data**: Supabase (Postgres, Auth, Storage)

## Global locale strategy

- Path-prefix routing: `/{locale}/…` (19+ languages)
- Default messaging: **en-US** for global SEO/OG; **cs** for Czech paths and legacy portal copy
- hreflang + canonical: `lib/ecosystem/seo.ts`, `lib/seo/metadata.ts`
- Device locale → cookie via middleware; header switcher overrides

## Code references

- Brand config: `lib/brand/magazine.ts`
- Homepage hero: `components/v271/portal-home.tsx`, `lib/v271/portal.ts`
- Metadata / JSON-LD: `lib/seo/json-ld.ts`, `app/layout.tsx`, `app/(public)/page.tsx`
- Locales: `locales/en-US/common.json`, `locales/cs/common.json`
