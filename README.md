# MedScopeGlobal

Production-ready medical intelligence platform: editorial articles, categories, VIP access, ads, admin CMS, and Supabase-backed auth.

## Stack

- **Next.js 14** (App Router, Server Actions)
- **Supabase** (Auth, Postgres, Storage)
- **Tailwind CSS** + Radix UI
- **TipTap** rich-text editor (admin)

## Quick start

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run migrations in order:
   - `supabase/migrations/20240525000000_initial_schema.sql`
   - `supabase/migrations/20240525000001_magazine_platform.sql`
   - `supabase/migrations/20240525000002_ingestion.sql`
3. Run seeds:
   - `supabase/seed-medical.sql` (categories + rubrics)
   - optionally `supabase/seed.sql`
4. Enable **Email** auth (Authentication → Providers).
5. Add redirect URL: `http://localhost:3000/auth/callback` (and your production URL).

### 2. Environment

```bash
npm run env:setup
```

`.env.local` is pre-filled for project `xcydgqnivxfhprbmdyym`. Add `OPENAI_API_KEY` for full AI ingestion.

Verify:

```bash
npm run db:verify
```

Apply DB migrations (once):

```bash
npm run db:migrate
```

This runs all `supabase/migrations/*.sql`, including the new translation metadata migration.

### 3. First admin user

1. Run the app and register at `/signup`.
2. Copy your user UUID from **Authentication → Users**.
3. In SQL Editor:

```sql
update public.users set role = 'admin' where id = 'YOUR_USER_UUID';
```

4. Open `/admin`.

### 4. Run locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### 5. Medical categories & auto articles

On first page load, the app upserts **27 medical specialties** into Supabase. The daily ingest now targets **80 articles per run** with dedupe hashing, editorial fallbacks, and med-track metadata. To seed and ingest articles immediately (no dev server required):

```bash
npm run content:bootstrap   # categories + up to 80 articles
# or separately:
npm run content:seed
npm run content:ingest
```

Browse specialties at `/categories`, `/medicina/priprava`, and `/medicina/studium`. On Vercel, ingestion runs daily via `vercel.json` cron (`CRON_SECRET` required) and uses `scripts/supabase-dedup.mjs` for hash-based duplicate prevention.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm run start`| Production server        |
| `npm run lint` | ESLint                   |
| `npm run content:bootstrap` | Seed specialties + ingest up to 80 daily articles |
| `npm run content:seed` | Upsert 27 medical categories |
| `npm run content:ingest` | Fetch RSS/PubMed, generate daily med content, and dedupe |
| `node scripts/supabase-dedup.mjs` | Backfill `hash_dedup` and detect duplicates |
| `npm run db:verify` | Check Supabase tables & env |

## Project structure

```
app/
  (public)/          # Homepage, articles, categories, search, account
  (auth)/            # Login, signup
  (admin)/admin/     # CMS: articles, categories, media, ads, VIP, notifications
  auth/callback/     # OAuth / email confirm handler
components/          # UI, layout, admin, editor
lib/                 # Supabase clients, queries, server actions
supabase/migrations/ # Database schema + RLS
types/               # Shared TypeScript types
```

## Key routes

| URL | Purpose |
|-----|---------|
| `/` | Magazine home |
| `/welcome` | Landing (access levels, rubrics, FAQ) |
| `/pricing` | Subscription plans |
| `/admin` | CMS (admin role required) |

See [docs/ROADMAP.md](docs/ROADMAP.md) for full specification coverage.

**Automated global ingestion:** [docs/LAUNCH.md](docs/LAUNCH.md) — WHO, NIH, CDC, BMJ, Lancet, EMA, PubMed + AI synthesis. Admin → **AI ingestion** or cron `/api/cron/ingest`.

## Features

- **Public site**: featured/latest articles, category pages, full-text search, SEO (sitemap, robots, JSON-LD, OG images).
- **Platform**: 3 access levels, i18n API + locale switcher, medical category seed, rubrics, pricing page.
- **VIP**: subscription records; VIP-only article body gating; ad-free for VIP readers.
- **Admin**: publish workflow, rich-text articles, media library (Storage bucket `media`), ads, VIP grants, notifications (per-user + VIP broadcast), audit logs (service role).
- **Auth**: Supabase email/password; profile sync to `public.users`.

## Windows build note

If `npm run build` fails with `EISDIR: illegal operation on a directory, readlink` on drive `D:` (or a synced/cloud folder), either:

- Move or clone the project to a local path on `C:` (e.g. `C:\dev\MedScopeGlobal`), or
- Enable **Developer Mode** in Windows Settings (allows npm symlinks), then reinstall: `Remove-Item -Recurse node_modules,.next; npm install`

`next.config.mjs` sets `experimental.webpackBuildWorker: false`, which helps on some setups.

Use the Windows helper script (builds from `%TEMP%`):

```bash
npm run build:win
```

## Locale & Translation System

**Automatically detects user's device language and translates content:**

- **Default language**: Czech (cs)
- **Auto-translation**: Articles in other languages are automatically translated using OpenAI (primary) or Google Translate (fallback)
- **Manual selection**: Users can select language in the header (top-right on desktop, "Auto" to revert)
- **Translation caching**: Results stored in `article_translations` table for performance
- **16+ languages supported**: CS, EN, DE, FR, ES, IT, PT, NL, PL, HU, SK, JA, KO, ZH, HI, AR

### Configuration

Set these environment variables for translation:

```env
# OpenAI (primary, higher quality medical translations)
OPENAI_API_KEY=sk-...

# Google Translate (fallback if OpenAI unavailable)
GOOGLE_TRANSLATE_KEY=AIzaSy...

# Locale defaults
INGESTION_LOCALE=cs           # New articles ingested in Czech
DEFAULT_SITE_LOCALE=cs        # Homepage default language
```

**Note**: At least one translation engine is required for production.

## Deploy (Vercel)

1. Import the repo and set environment variables:
   - All required variables from `.env.example`
   - **Translation keys** (see Locale & Translation System above)
   - `NEXT_PUBLIC_SITE_URL` = your production domain
2. Add production callback URL in Supabase Auth settings.
3. Apply any pending migrations: `npm run db:migrate`

**For production deployment details, see [docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md)**
4. Run the SQL migration on your production Supabase project.

## Security notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
- Service role is used only in server actions after `requireAdmin()` or in the auth callback profile upsert.
- Review RLS policies in the migration before going live.

## License

Private / all rights reserved unless otherwise specified.
