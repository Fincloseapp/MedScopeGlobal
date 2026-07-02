# MedScope Academy v35.0 ULTRA — Master Spec Index

> Condensed table of contents for MASTER PROMPT blocks 1–11.  
> Full specification is maintained outside this repo. Phase 1 implements Block 2 (core DB), Block 3 (MVP API), Block 4 (admin skeleton), Block 5 (AI controller stubs), Block 7 (public MVP UI).

## Block 1 — Vision & Product

- MedScope Academy: AI-powered medical education platform integrated with MedScopeGlobal v27.3+
- Audiences: students, residents, physicians, public health learners
- Czech-first UI, evidence-based content, gamification (XP, leaderboard, certificates)
- Marketplace, mentoring, clinical simulations (Phase 2+)

## Block 2 — Database Schema

- **Core:** `courses`, `lessons`, `quizzes`, `quiz_questions`
- **AI:** `ai_tasks`, `ai_logs`, `ai_expert_reviews`
- **Gamification:** `xp_events`, `leaderboard`, `user_progress`, `certificates`
- **Marketplace:** `marketplace_courses`, `mentoring_sessions`
- **Assets:** `video_assets`, `clinical_simulations`, `textbooks`
- **Extended:** `system_tests`, `study_games`, `ai_scenarios`, `marketing_events`
- Migration: `supabase/migrations/20260619120000_academy_v35_core.sql`

## Block 3 — API Layer

- `GET/POST /api/academy/courses`
- `GET /api/academy/courses/[id]`
- `GET /api/academy/lessons/[id]`
- `GET /api/academy/quizzes/[id]`, `POST` submit
- `POST /api/academy/ai/generate-course` (queues `ai_tasks`)
- `GET /api/academy/leaderboard`
- `POST /api/academy/progress/update`
- `GET /api/academy/health`

## Block 4 — Admin Panel

- Phase 1: `/admin/academy` dashboard counts, `/admin/academy/courses` list
- Phase 2+: course editor, AI pipeline monitor, marketplace admin, mentoring scheduler

## Block 5 — AI Controller

- `lib/academy/ai/controller.ts` — task dispatch, `ai_logs`
- `lib/academy/ai/experts.ts` — expert review stubs
- `lib/academy/ai/workers/` — course-creator, lesson-generator stubs
- Phase 2+: OpenAI video, full worker fleet, expert routing

## Block 6 — Mobile App

- **Deferred Phase 2+** — React Native / Expo companion app

## Block 7 — Public Frontend

- `/academy` hub, `/academy/courses`, `/academy/courses/[slug]`
- Components: `CourseCard`, `PageHeader`
- Homepage CTA + main navigation entry

## Block 8 — Payments & Marketplace

- **Deferred Phase 2+** — Stripe checkout for marketplace courses

## Block 9 — Cron & Automation

- `/api/cron/academy-daily` — health check + optional content generation hook
- Vercel cron in `vercel.json`

## Block 10 — Testing & QA

- `scripts/academy-v35-smoke.mjs` — prod smoke for routes + homepage CTA
- `scripts/verify-academy-v35-skeleton.mjs` — predeploy file checks

## Block 11 — Deploy & Ops

- Integrates with existing `npm run predeploy` gates
- No secrets in git; AI keys server-only via env

---

See also: [academy-v35-ROADMAP.md](./academy-v35-ROADMAP.md)
