# MedScope Academy v35 — Roadmap

## Phase 1 (shipped) — Foundation

- Core Supabase tables + RLS
- MVP API routes and health endpoint
- AI controller skeleton (task queue, logging stubs)
- Public hub + course list/detail pages
- Admin dashboard counts + course list
- Homepage CTA + navigation
- Daily cron hook
- Smoke tests + predeploy skeleton verify

## Phase 2 — Content & AI Workers

- Full course-creator and lesson-generator workers (OpenAI)
- Expert review workflow (`ai_expert_reviews`)
- Course editor in admin
- Quiz builder integration with Academy tables
- Seed demo courses (anatomie, farmakologie)
- Video asset upload pipeline

## Phase 3 — Gamification & Social

- XP events on lesson/quiz completion
- Live leaderboard UI
- Certificate PDF generation
- Study games (`study_games` table wiring)

## Phase 4 — Marketplace & Mentoring

- Stripe payments for `marketplace_courses`
- Mentor booking flow
- Clinical simulations player

## Phase 5 — Mobile

- Expo/React Native app
- Offline lesson cache
- Push notifications for mentoring

## Phase 6 — Enterprise

- B2B academy licenses
- University SSO
- Analytics dashboard
- Marketing automation (`marketing_events`)

## Non-goals (Phase 1)

- No mobile app
- No AI video generation
- No full admin sections (videos, simulations, marketplace admin)
- No breaking changes to v27.3 Stripe, veřejnost, or existing routes
