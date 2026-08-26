# MedScopeGlobal — Global Marketing Plan

## Brand stack

| Layer | Name | URL |
|-------|------|-----|
| Platform | **MedScopeGlobal** | medscopeglobal.com |
| Magazine | **VitaScope** | medscopeglobal.com (editorial home `/`, `/articles`) |

**VitaScope** positioning: global health & longevity magazine — longevity, wellness, and healthy lifestyle for everyone who aspires to improve. EN tagline: *See life clearly. Live it longer.*

Ecosystem upsell on every touchpoint: MediFlow journal, VIP protocols, MeDipacient · MeDiprep · OrdiZapis, Academy, tringelt tips.

See `docs/brand/magazine-brand.md` and `docs/MASTER_PROMPT.md`.

---

## Overview

MedScopeGlobal transforms into a multilingual health ecosystem targeting USA, EU, Asia, and Russia with autonomous **VitaScope** editorial, multi-engine SEO, and diversified monetization.

---

## 1. USA Market

### Ad Providers
- **Mediavine** (primary, 50k+ sessions/mo threshold)
- **Ezoic** (growth phase alternative)
- **AdThrive** (premium health vertical)
- **Google AdSense** (fallback)

### Social Channels
- TikTok (GLP-1, longevity, biohacking shorts)
- Instagram Reels (sleep optimization, supplement stacks)
- YouTube Shorts (protocol explainers)
- Reddit (r/longevity, r/Biohackers, r/sleep)

### Content Topics
- GLP-1 and metabolic health
- Longevity protocols (Huberman-style framing)
- Biohacking for beginners
- Sleep optimization (Oura/Whoop audience)
- Mental wellness and cortisol management

### VIP Pricing
- **$6.99/month** (en-US locale)
- Stripe Price ID: configure in dashboard

### SEO
- Google News USA submission
- Google Discover optimization (large images, fresh content)
- hreflang: en-US preferred for US/CA visitors

---

## 2. EU Market (CZ, SK, PL, DE, FR, IT, ES, RO, HU)

### Ad Providers
- Google AdSense (primary)
- Mediavine EU (50k+ sessions)
- Native pharma/sponsor campaigns via admin CMS

### Social Channels
- Instagram, Facebook, YouTube
- Local platforms: Seznam (CZ), Onet (PL)

### Content Topics
- Prevention and nutrition
- Sleep and supplements
- Women's/men's health
- Longevity (European framing — prevention-focused)

### VIP Pricing
- **149 Kč/month** (CZ), **5.99 €/month** (DE/FR/IT/ES)
- Localized Stripe prices per currency

### SEO
- Google + Seznam (CZ)
- hreflang for cs-CZ, sk-SK, pl-PL, de-DE, etc.

---

## 3. Asia Market (CN, JP, KR, VN, ID)

### Ad Providers
- **Baidu Ads** (China — requires ICP license)
- **Naver Ads** (Korea)
- Google AdSense (JP, VN, ID)

### Social Channels
- WeChat (CN), LINE (JP), KakaoTalk (KR)
- TikTok Asia, Xiaohongshu (CN beauty/wellness)

### Content Topics
- Anti-aging and beauty wellness
- Mental health (stigma-aware framing)
- Traditional + modern wellness integration

### VIP Pricing
- **¥600/month** (JP), **₩6,000/month** (KR), **¥25/month** (CN)

### SEO
- Baidu (zh-CN), Naver (ko-KR), Google (ja, vi, id)
- Localized sitemaps per language

---

## 4. Russia & CIS (RU, UA, BY)

### Ad Providers
- **Yandex Ads** (primary)
- Google AdSense (fallback where available)

### Social Channels
- VK, Telegram, Yandex Zen

### Content Topics
- Healthy lifestyle and prevention
- Supplements (local brands)
- Sleep and stress management

### VIP Pricing
- **299 ₽/month**

### SEO
- Yandex Webmaster verification
- hreflang: ru-RU, uk-UA, be-BY

---

## 5. Monetization Stack

| Channel | Implementation | Priority |
|---------|---------------|----------|
| Display ads | `GlobalAdSlot` component, provider by locale | High |
| VIP subscriptions | Stripe checkout, 4 tiers + VIP longevity | High |
| Tringelt (micro-tip) | `ArticleTringeltTip`, `/api/ecosystem/article-tip` | Medium |
| MediFlow | Wellness journal, article save, supplement tracking | High |
| Micro-donations | Stripe one-time, `/api/ecosystem/donate` | Medium |
| Affiliate boxes | `AffiliateBox` in articles, regional URLs | Medium |
| Sponsored articles | Admin CMS ad campaigns | Medium |
| B2B/pharma | `/firmy` existing infrastructure | Low (scale later) |

---

## 6. Autonomous Operations

Cron tasks (via `/api/ecosystem/autonomous`):

| Task | Schedule | Description |
|------|----------|-------------|
| generate-articles | Daily 06:00 | LLM + editorial review |
| translate-content | Daily 08:00 | All locale variants |
| seo-optimize | Daily 10:00 | Metadata, JSON-LD, keywords |
| place-ads | Every 4h | High-CTR positions |
| generate-vip-content | Weekly Mon 07:00 | Longevity protocol updates |

Safety guardrails: max 5 articles/day, editorial review required, blocked topics list, mandatory disclaimers.

---

## 7. Risk Mitigation

- **Legal**: Medical disclaimers on all health content (per-locale)
- **GDPR**: EU data processing, consent banners
- **Content**: No diagnosis claims, no miracle cures, editorial review
- **SEO**: No duplicate content (canonical + hreflang), no black-hat
- **Technical**: Cloudflare CDN, rate limiting, lazy loading, caching
- **Autonomous**: Human review for en-US, ru, zh-CN locales

---

## 8. KPIs

| Metric | Target (6 months) |
|--------|-------------------|
| Monthly sessions | 500k+ |
| Ad CTR | 2.5%+ |
| VIP conversion | 1.5% of logged-in users |
| Donation rate | 0.5% of article readers |
| Locale coverage | 19 languages live |
| Autonomous articles/week | 25+ (with review) |
