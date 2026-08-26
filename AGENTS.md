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
- All three PWAs share chrome: `AppAccountStatus` (účet / přístup / platnost + Přihlášení) and
  `AppSectionNav` (always-visible section tabs + fixed mobile bottom bar). Layouts must stay a
  single `h-[100dvh]` flex column with `AppOriginBar` + `flex-1` children.
- Homepage (`/`) uses Czech **PortalHome** (search + services + magazine feed + phone mockups),
  not the old Unsplash `V271HomeHero`. App cards use `APP_MARKETING_IMAGE`.
- In-app brand art uses the same files via `AppBrandVisual` /
  `APP_MARKETING_IMAGE` (`/assets/marketing/medipacient.webp`, `mediprep.webp`, `ordizapis-phone-v2.webp`).
- Session/eligibility payloads include `access: AppAccessInfo` (accountLabel, planLabel,
  validityLabel from `vip_subscriptions.ends_at` when available).
- **MeDiprep** `/app/priprava`: client fallback tests; header + status bar login; tab Testy builder.
- **MeDipacient** `/app/pacient`: demo timeline; header login; tabs Přehled / Zprávy / Nahrát / Účet.
- **OrdiZapis** `/app/dokumentace`: eligibility gate for zápis/historie; header login; tabs Zápis /
  Historie / Návod / Účet.
- Homepage/portal `AppOpenLink` opens apps in the same tab. MeDiprep SW must not cache-first
  `/_next/*`; bump `CACHE_NAME` when changing shell markup.
- **PWA install:** Chromium only fires `beforeinstallprompt` on pages inside manifest `scope`.
  Icons must be truecolor PNG (RGBA). iOS uses Safari Share → Přidat na plochu (no BIP).

### Cloud agent (Linux) path override
- `lib/config/paths.mjs` defaults `MEDSCOPE_PROJECT_ROOT` to `D:\medscope.local` on non-CI Linux.
  Cloud agents run in `/workspace` — export before path-sensitive scripts:
  `export MEDSCOPE_PROJECT_ROOT=/workspace` (or add to Cursor environment secrets).
- Scripts affected: `pnpm db:migrate`, anything using `projectPath()` without override.

### Minimum `.env.local` for cloud dev (gitignored)
| Key | Required for |
|-----|----------------|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dev server, public pages |
| `NEXT_PUBLIC_SITE_URL` | canonical URLs (`https://medscopeglobal.com`) |
| `SUPABASE_SERVICE_ROLE_KEY` | `pnpm db:verify`, article SSR, editorial backfill |
| `CRON_SECRET` | `pnpm db:verify` (≥32 chars) |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | optional local `pnpm cf:deploy` |
| `SUPABASE_ACCESS_TOKEN` | optional `pnpm db:migrate` (Management API) |

After deploy-agent sessions, add `SUPABASE_SERVICE_ROLE_KEY` from D: backup (`pnpm restore:d` on PC)
or Cursor Secrets — anon key alone cannot verify ecosystem tables or run backfill.

### Ecosystem migrations (20260825*)
Production deploy does **not** auto-apply SQL. After merge, run the three files in order (see
`docs/deploy/POST_MERGE_CHECKLIST.md` §2) via Supabase SQL Editor or `pnpm db:migrate`.
Verify: `pnpm db:verify` → ✓ for `mediflow_*`, `article_syndications`, `editorial_queue`,
`article_image_suggestions`. Anon REST probe returning `PGRST205` means not applied yet.

### Security — token rotation (recommended, non-blocking)
After a cloud agent used deploy credentials (skipped GH secrets rotation is OK to unblock setup),
**rotate on a best-effort schedule**:
- **Cloudflare:** create a new API token, update Workers Builds / `.env.local`, revoke the old token.
- **GitHub Actions:** rotate `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_ENV_JSON`
  if the agent had access.
- **Supabase:** rotate `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_ACCESS_TOKEN` if they were exposed
  in agent logs; update Worker vars via dashboard or `pnpm cf:env:sync` on D:.

Never commit secrets. Use Cursor Secrets, D: `.env.local`, or Cloudflare dashboard Variables.

### Cloudflare Workers production deploy
- Worker name / project: `medscopeglobal` (`wrangler.jsonc`). Domain routes: `medscopeglobal.com/*`.
- **Cloudflare dashboard → Create and deploy / Workers Builds**
  - Project name: `medscopeglobal`
  - Production branch: `main`
  - Root directory: `/`
  - Build command: `npm run cf:build`
  - Deploy command: `npx opennextjs-cloudflare deploy`
  - Or leave Build empty and set Deploy to: `npm run deploy`
- **GitHub Actions** (`.github/workflows/cloudflare-deploy.yml`) needs secrets
  `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` (optional `CLOUDFLARE_ENV_JSON`).
  Without them the workflow fails fast; Workers Builds still works via the dashboard.
- Local/CI with tokens: `pnpm cf:deploy` (builds + deploys). Smoke: `pnpm cf:smoke`.

### Windows D: local workspace
- Canonical PC root is **`D:\medscope.local`** (data `D:\medscope.data`, logs `D:\medscope.logs`).
- Cloud agents cannot write the Windows D: drive. To refresh the PC from GitHub after cloud work:
  `pnpm pull:d` (or `powershell -File .\scripts\pull-cloud-to-d.ps1`) inside `D:\medscope.local`.
- **Secrets + backup on the PC** (see `docs/deploy/RESTORE_FROM_D.md`):
  - `pnpm restore:d` — select keys from D: `.env.local` → workspace, `cf:env:sync`, optional GH secrets, checklist
  - `pnpm backup:d` — dated backup under `D:\medscope.data\backups\YYYY-MM-DD\` (git bundle + `.env.local` + manifest)
  - `pnpm sync:d` — restore + verify + backup one-shot (`-Deploy` / `-IncludeZip` optional)
- Do not use `pnpm push:github` for pull — that overwrites GitHub from D:.
- Keep local `.env.local` intact; article SSR listings need `SUPABASE_SERVICE_ROLE_KEY` (anon alone
  cannot `select=*` on `articles`).
- After pull: `pnpm verify:articles` against production, or
  `MEDSCOPE_ORIGIN=http://localhost:3000 pnpm verify:articles` with `pnpm dev` running.

### Article listings (non-obvious)
- Public article cards use `createDataClient()` (service role preferred). Anon JWT may only allow
  narrow column grants — `select=*` then 401s and hubs show empty (“brzy objeví”).
- `/articles` includes lay/public Czech rows (same pool as portal Zpravodajství).
- Detail URL is `/article/[slug]` (singular). `/studenti/clanky` and `/lekari/clanky`
  redirect to article listings via `next.config.mjs`.

### Repo hygiene note
- The repo root is cluttered with transient scratch/log files (`_poll-*.mjs`, `*-log.txt`,
  `*-audit*.md`, `tmp-*`, `vercel.json.bak`). These are not part of the app.
