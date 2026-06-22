# MedScopeGlobal — implementation roadmap

Project name: **MedScopeGlobal** (all branding, docs, and UI).

## Status legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Implemented and runnable |
| 🟡 | Foundation / API stub — needs production wiring |
| ⬜ | Planned (next phase) |

## 1) Core platform — ✅

- Next.js 15 App Router, Supabase auth, CMS admin
- Articles, categories, VIP, ads, notifications, media
- Brand colors `#005B96`, `#FFFFFF`, `#C7E3FF`
- Config: `lib/config/site.ts`

## 2) Access levels — 🟡

| Feature | Status |
|---------|--------|
| 3 levels (public / student / physician) | ✅ config + signup |
| DB columns `access_level`, `verification_status` | ✅ migration 002 |
| Content gating by `min_access_level` on articles | ⬜ wire in queries |
| Credential upload + AI verification | ⬜ |
| Admin approval UI | ⬜ |

## 3) Categories & rubrics — 🟡

| Feature | Status |
|---------|--------|
| Full specialty list | ✅ `seed-medical.sql` |
| Rubrics table + seed | ✅ |
| Article `rubric_slug` column | ✅ migration |

## 4) i18n — 🟡

| Feature | Status |
|---------|--------|
| `locales/cs`, `locales/en` UI strings | ✅ |
| `/api/locale/detect`, `/api/locale/set` | ✅ |
| Locale switcher in header | ✅ |
| Remaining 14 locale folders | ⬜ copy from `en` template |
| Auto content/ads/email translation | ⬜ |

## 5) Monetization (Stripe) — 🟡

| Feature | Status |
|---------|--------|
| Pricing page (149 / 499 / 2490 CZK) | ✅ `/pricing` |
| `licences`, `payments` tables | ✅ migration |
| Stripe Checkout + webhooks | ⬜ needs `STRIPE_*` keys |
| Trial 7 days, paywall | ⬜ |

## 6) Advertiser VIP benefit — 🟡

| Feature | Status |
|---------|--------|
| `/api/ads/free-subscriptions/calculate` | ✅ |
| assign / expire (admin) | ✅ |
| `free_subscriptions` table | ✅ |
| Inzerent UI + email automation | ⬜ |

## 7) AI Advertising Engine — 🟡

| Feature | Status |
|---------|--------|
| `ad_campaigns` workflow schema | ✅ |
| Inzerent form + AI visuals | ⬜ |
| Admin approve → Stripe link → publish | ⬜ |
| Email to `ADMIN_NOTIFY_EMAIL` | ⬜ |

## 8) AI content generators — 🟡

| Feature | Status |
|---------|--------|
| Automated RSS + PubMed ingestion | ✅ |
| AI article synthesis (OpenAI) | ✅ with key |
| Fallback without OpenAI | ✅ |
| Cron every 6h (`vercel.json`) | ✅ |
| Admin `/admin/ingestion` | ✅ |
| Per-category source config | ✅ `lib/ingestion/sources.ts` |
| Study / quiz / chatbot generators | ⬜ |

## 9) Extended UI centers — ⬜

- Ticketing, suppliers, partners, marketing dashboards
- Personalized feed, mood checks

## 10) Landing — ✅

- `/welcome` — hero, access levels, rubrics, FAQ
- `/pricing` — plans

## 11) Tests — ⬜

- Playwright / Vitest suites per module

## 12) Deploy — 🟡

- Vercel-ready (`npm run build:win` on Windows)
- GitHub Actions — ⬜

## 13) Documentation — 🟡

| Doc | Status |
|-----|--------|
| README (install) | ✅ |
| ROADMAP (this file) | ✅ |
| User / API / security manuals | ⬜ next batch |

## Run checklist

```bash
npm install
# Supabase: run migrations 001 + 002, then seed-medical.sql
cp .env.example .env.local
npm run dev
```

Open: http://localhost:3000 · http://localhost:3000/welcome · http://localhost:3000/admin
