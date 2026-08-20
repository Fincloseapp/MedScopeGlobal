# AGENTS.md

## Cursor Cloud specific instructions

MedScopeGlobal is a single **Next.js 15 (App Router)** application (package name `med-scope-global`)
that also contains a separate **Expo/React Native** app under `mobile/`. Production deploys to
Cloudflare Workers via OpenNext; the source of truth for data is **Supabase** (Postgres + Auth + Storage).

### Package manager & tooling
- Use **pnpm** (`packageManager: pnpm@9.15.4`). It is the authoritative manager even though a
  `package-lock.json` is also committed — do not use `npm install`. Node 22 works.
- Dependencies are installed by the startup update script (`pnpm install`); you normally do not
  need to reinstall.

### Required environment to boot the dev server (non-obvious)
- `lib/env.ts` `getPublicEnv()` **throws** `Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY`
  when those are unset, so pages that call it error out until Supabase env vars exist.
- The vars are read from `process.env` (Cursor **Secrets** are injected as env vars) or from a
  git-ignored `.env.local`. The three that matter most: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- If real Supabase credentials are not available, create a `.env.local` with **placeholder** values
  (e.g. `NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co`, and any non-empty anon/service
  keys) — this is enough to boot the dev server and exercise the client-side PWA flows below. Real
  credentials unlock Supabase-backed features (auth/login, articles, admin CMS, Academy). See
  `.env.example` for the full list of optional integrations (Groq/OpenAI/Gemini AI, Stripe, SendGrid).
- `pnpm env:setup` is a **Windows PowerShell** script — do not run it on Linux; create `.env.local` manually.

### Run / lint / test / build
- Dev server: `pnpm dev` (http://localhost:3000) or `pnpm dev:d` (binds `0.0.0.0:3000`). Use `dev:d`
  when the browser/tester needs to reach it over the network.
- Lint: `pnpm lint` (only `<img>` warnings currently; exits 0). Typecheck: `pnpm typecheck`.
- `pnpm build` runs the **Cloudflare OpenNext** build (`scripts/run-cloudflare-build.mjs`), which is
  heavier than a plain `next build` and targets Workers — for local development just use `pnpm dev`.
- `pnpm test` runs a placeholder script plus `scripts/apps/functional-check.ts` (tsx); there is no
  conventional unit-test suite. The many `pnpm smoke:*` / `verify-*` scripts target deployed
  environments and generally need real credentials.

### Good no-credential smoke targets (degrade gracefully without Supabase)
- **MeDiprep** exam-prep PWA at `/app/priprava`: the client shell fetches `/api/mediprep/*` but
  falls back to fully client-side generated tests/dashboards, so you can start a practice test,
  answer questions, and get a score with no external services. Test builder (tab **Testy**) lets
  you pick mode / subject / count / faculty. Login is always in the app header.
- **MeDipacient** patient-report PWA at `/app/pacient` renders a client demo dashboard similarly.
- **PWA install:** Chromium only fires `beforeinstallprompt` on pages inside manifest `scope`
  (`/app/priprava` for MeDiprep). The **Stáhnout** button on marketing/download pages redirects
  to `/app/priprava?install=1`. Icons must be truecolor PNG (RGBA). iOS uses Safari Share →
  Přidat na plochu (no BIP).

### Repo hygiene note
- The repo root is cluttered with transient scratch/log files (`_poll-*.mjs`, `*-log.txt`,
  `*-audit*.md`, `tmp-*`, `vercel.json.bak`). These are not part of the app.
