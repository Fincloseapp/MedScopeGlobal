# Ad accounts & monetization setup (operators)

Goal: open the highest-ROI revenue accounts first, then wire env keys so
`GlobalAdSlot` starts serving. Until keys exist, slots render **nothing**
(no dashed placeholders in production).

Canonical inventory: `lib/ecosystem/monetization.ts` → `AD_INVENTORY`.
Code map: `docs/monetization/AD_INVENTORY.md`.

---

## Priority order (highest income first)

| Priority | Account / channel | Why | When to create |
|----------|-------------------|-----|----------------|
| **P0** | **Stripe** (live) | VIP + Tringelt tips + donations — highest margin, already coded | Immediately if not live |
| **P0** | **Google AdSense** | Fastest display-ad path for EU + global; works at low traffic | Site has real content + privacy policy |
| **P1** | **Amazon Associates** (US/UK) + **Heureka / CZ affiliates** | Affiliate boxes + `/go/[slug]` already ship | After 1–2 weeks of stable traffic |
| **P1** | **Mediavine** (or Ezoic / AdThrive) | Higher RPM than AdSense once you clear traffic thresholds | Apply when you approach network minima (~50k sessions/mo typical) |
| **P2** | **Yandex Advertising** (RU/UK/BE locales) | Regional fill where AdSense is weak | After RU/UK content volume |
| **P2** | Sponsored / CMS ads (`admin/ads`) | Direct B2B & pharma later | After sales motion exists |
| **P3** | Naver / Baidu | Asia locales only | After zh-CN / ko / ja desks mature |

Do **not** stack AdSense + Mediavine on the same page without network approval.
Prefer one primary display network per locale (see `AD_PROVIDERS_BY_REGION`).

---

## 1. Stripe (VIP, Tringelt, donations) — do first

1. Create / verify Stripe account for the legal entity (see `.env.example` legal block).
2. Enable Checkout + Customer Portal; turn on currencies you price in (`VIP_PRICING`, `ARTICLE_TIP_TIERS`).
3. Set secrets (Workers + GitHub / D: `.env.local`):
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Webhook URL: `https://www.medscopeglobal.com/api/stripe/webhook`
5. Smoke: tip CTA on `/article/[slug]` → Checkout; VIP at `/vip/protokoly`.

Without Stripe, Tringelt returns 503 and shows “unavailable”.

---

## 2. Google AdSense

1. [adsense.google.com](https://www.adsense.google.com) → create account for `medscopeglobal.com`.
2. Verify site ownership (DNS / meta / Workers).
3. Complete tax + payment profile (same legal entity as Stripe when possible).
4. Create **auto ads** or individual ad units matching inventory:
   - below-title / in-content / footer (articles)
   - mid + footer (homepage)
   - below-fold (app landings)
5. Env (must set **both**):

```bash
NEXT_PUBLIC_ADS_ENABLED=true
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-6820104998820692
```

Owner pub is already live in code + `ads.txt`. In the AdSense dashboard enable
**Auto ads** (in-page + anchor). Block unsuitable categories (miracle cures,
unlicensed pharma). Do not invent extra slot IDs.

Optional local layout preview (never enable in production):

```bash
NEXT_PUBLIC_ADS_SHOW_PLACEHOLDERS=1
```

6. Deploy Workers with public vars, then hard-refresh article + homepage.
7. GDPR: ensure consent banner covers personalized ads before EU serve.

---

## 3. Mediavine / Ezoic / AdThrive (higher RPM)

| Network | Typical bar | Env |
|---------|-------------|-----|
| Mediavine | ~50k sessions/mo | `NEXT_PUBLIC_MEDIAVINE_SITE_ID=…` |
| Ezoic | lower bar, script-based | `NEXT_PUBLIC_EZOIC_SITE_ID=…` |
| AdThrive | invite / higher bar | Prefer Mediavine path; use `native` later |

Also set `NEXT_PUBLIC_ADS_ENABLED=true`. Locale preference is in
`getAdProvidersForLocale()` (USA → Mediavine first when configured).

Wire network head scripts per their onboarding docs (Mediavine often injects
site-wide; our slots are empty containers with `data-ad-provider="mediavine"`).

---

## 4. Affiliate networks

Existing product boxes call `/go/[slug]` → `AFFILIATE_REDIRECT_DESTINATIONS`.

| Region | Suggested network | Action |
|--------|-------------------|--------|
| US | Amazon Associates | Replace `amazon.com` search URLs with tagged affiliate links |
| UK/EU EN | Amazon Associates UK / Impact | Same for `mg-en`, `omega-en`, `sleep-en` |
| CZ/SK | Heureka / CJ / brand programs | Keep Heureka until direct brand deals |
| Sleep wearables | Oura / Whoop partner programs | Swap `sleep-us` destination when approved |

Update destinations in `lib/ecosystem/monetization.ts` only after program approval —
do not invent tag IDs.

---

## 5. Expected placements (summary)

| Surface | Placement | Size guidance | Notes |
|---------|-----------|---------------|-------|
| Homepage | mid (`in-content`) | 728×90 / 300×250 / 320×100 | After magazine, before apps |
| Homepage | footer | 728×90 / 320×50 | Before closing CTA |
| Article | below-title | 728×90 / 300×250 | Highest CTR |
| Article | in-content | 300×250 / responsive | After body |
| Article | footer | 728×90 | After tip + affiliate |
| `/mediflow`, `/medipacient`, `/ordizaznam` | in-content | 728×90 / 300×250 | Below fold only |

Sticky mobile (`placement="sticky"`) is inventory-ready but **not** mounted by
default — enable only with consent + explicit product decision.

---

## 6. Revenue checklist (operator)

- [ ] Stripe live keys on Workers + webhook healthy (`/api/v29/health`)
- [ ] AdSense approved + `NEXT_PUBLIC_ADS_ENABLED=true` + client id
- [ ] Privacy / cookies pages mention ads + affiliates
- [ ] Affiliate tags live in `/go/*` destinations
- [ ] Mediavine application filed when traffic qualifies
- [ ] VIP + Tringelt CTAs visible on unlocked articles
- [ ] No dashed “Ad preview” boxes in production (`ADS_SHOW_PLACEHOLDERS` unset)

---

## 7. Related code

| Path | Role |
|------|------|
| `components/monetization/global-ad-slot.tsx` | Feature-flagged display unit |
| `components/monetization/article-tringelt-tip.tsx` | Article micro-tip |
| `components/monetization/article-cta.tsx` | Donations, MediFlow save, VIP nudge |
| `components/monetization/affiliate-box.tsx` | In-article affiliate |
| `app/api/ecosystem/article-tip/route.ts` | Tip Checkout |
| `app/api/ecosystem/donate/route.ts` | Donation Checkout |
| `app/(public)/go/[slug]/route.ts` | Affiliate redirect |
| `lib/ecosystem/monetization.ts` | Pricing, inventory, providers |
| `components/ads/*` | First-party / CMS partner ads (separate from AdSense) |

See also: `docs/MASTER_PROMPT.md` (monetization), `docs/marketing/global-plan.md` §5,
`docs/editorial/autonomous-redakce.md` (Tringelt).
