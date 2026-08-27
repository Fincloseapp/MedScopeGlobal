# MedScopeGlobal — Internet discoverability & locale mutations

Status snapshot from production probes (`https://medscopeglobal.com`) plus code audit on branch `cursor/i18n-seo-discover-2b2d`.

## How foreign-language mutations work

1. **Path-prefix locales** — Public marketing pages live under `/{segment}/…` (e.g. `/de/articles`, `/en-us`, `/cn`). Middleware rewrites the prefix away and sets the `medscope_locale` cookie from the path segment.
2. **Canonical segments** — Official URL prefixes (see `localeToPathSegment` in `lib/i18n/locale-path.ts`):

   | Locale code | URL segment | Notes |
   |---|---|---|
   | `cs` | `/cs` | Default / `x-default` |
   | `en` | `/en` | International English |
   | `en-US` | `/en-us` | US English |
   | `de` `fr` `es` `it` `pl` … | `/{code}` | Same as code |
   | `zh-CN` | `/cn` | Alias `/zh-cn` → 308 `/cn` |
   | `ja` | `/jp` | Alias `/ja` → 308 `/jp` |
   | `ko` | `/kr` | Alias `/ko` → 308 `/kr` |

3. **Geo / Accept-Language** — Requests without a locale prefix redirect to `/{detected}/…` using CF country (`localeFromCountry`) or `Accept-Language`, unless the user set a manual locale cookie.
4. **Dictionaries** — `locales/{code}/common.json` via `getDictionary()`. Thin locale files deep-merge onto `en` then `cs` so missing keys fall back instead of showing raw paths.
5. **Editorial / articles** — Per-locale sitemaps list static hub URLs always; article URLs only when `articles.locale` matches (Czech corpus dominates `sitemap-cs.xml`).
6. **Hreflang** — `buildGlobalHreflang()` emits all 19 `GLOBAL_LOCALES` + `x-default` → `/cs…` on homepage (and helpers in `lib/seo/metadata.ts`).

PWAs (`/app/*`), API, admin, and sitemap/robots paths are **excluded** from locale redirects.

## Production locale matrix (homepage)

Probed with follow-redirects. Status meanings:

- **works** — 200 on canonical segment, locale-aware title (or intentional EN), correct canonical, full hreflang set, `html[lang]` sane
- **partial** — route OK + SEO tags OK, but UI dictionary still thin / copy falls back to EN for non-hero chrome, or few articles in that sitemap
- **broken** — 404 or wrong locale collapse (pre-fix production issues noted)

### Live probe — 2026-08-27 (pre-i18n deploy)

Worker cache-tag `medscope-ui-v23.0`. Measured on `https://medscopeglobal.com`:

| Request | HTTP | Cookie `medscope_locale` | Canonical | `og:locale` | `<html lang>` | Title locale | Verdict |
|---|---|---|---|---|---|---|---|
| `/cs` | 200 | `cs` | `/cs` | `cs_CZ` | `cs` | CS | **works** |
| `/en` | 200 | `en` | `/en` | `en_US` | `en` | EN | **works** |
| `/en-us` | 200 | `en` (bug) | `/en` (bug) | `en_US` | `en` | EN | **partial** — cookie + canonical collapse to `en` |
| `/de` | 200 | `de` | `/de` | `cs_CZ` (bug) | `de` | EN title | **partial** |
| `/pl` | 200 | `pl` | `/pl` | `cs_CZ` (bug) | `pl` | EN title | **partial** |
| `/fr` | 200 | `fr` | `/fr` | `cs_CZ` (bug) | `fr` | EN title | **partial** |

Hreflang count on all homepage locales: **20** (19 + `x-default`).

Robots / sitemaps (same probe):

| Asset | HTTP | Notes |
|---|---|---|
| `/robots.txt` | 200 | Lists `/sitemap.xml` + 19 locale sitemaps (`sitemap-cs.xml` … `sitemap-en-us.xml`) |
| `/sitemap.xml` | 200 | Index present |
| `/sitemap-cs.xml` | 200 | **1018** `<url>` entries |
| `/sitemap-en-us.xml` `/sitemap-de.xml` `/sitemap-pl.xml` `/sitemap-fr.xml` | 200 | **18** URLs each (static hubs only) |

### Matrix after this branch (code)

| Request | Canonical | Prod (pre-fix) | After fixes (code) | Notes |
|---|---|---|---|---|
| `/cs` | `/cs` | **works** | works | Czech title + description |
| `/en` | `/en` | **works** | works | EN international |
| `/en-us` | `/en-us` | **partial** | works | Was collapsing canonical → `/en` via `normalizeLocale` bug |
| `/de` `/fr` `/es` `/it` `/pl` | same | **partial** | works* | Route + hreflang OK; titles were EN-only → localized claims added; `og:locale` was stuck `cs_CZ` |
| `/jp` | `/jp` | **works** | works | Japanese segment |
| `/ja` | `/jp` | **broken** (→ `/en/ja` 404) | works (308→`/jp`) | Alias now recognized + redirected |
| `/cn` | `/cn` | **works** | works | Chinese segment |
| `/zh-CN` `/zh-cn` | `/cn` | **partial** (200 duplicate) | works (308→`/cn`) | Prefer single canonical |
| `/ko` | `/kr` | **partial** (duplicate) | works (308→`/kr`) | |
| `/kr` | `/kr` | **works** | works | |

\*Non-CS/EN magazines still use EN for many UI chrome strings until dictionaries are fully filled; homepage **title/description/hero claim** are localized for top locales.

## SEO checklist (Google-facing)

| Signal | Status | Location |
|---|---|---|
| `robots.txt` allow + multi-bot rules | ✅ | `app/robots.ts` → live |
| Sitemap index + 19 locale sitemaps | ✅ | `/sitemap.xml`, `/sitemap-{seg}.xml` listed in robots |
| Per-locale static hubs in sitemaps | ✅ | `lib/seo/locale-sitemap.ts` (~18 URLs when no locale articles) |
| Czech article volume in `sitemap-cs.xml` | ✅ | ~1000+ URLs on prod |
| Non-CS article syndication in sitemaps | ⚠️ gap | Most locale sitemaps static-only until editorial pipeline fills `articles.locale` |
| Homepage `<title>` / meta description per locale | ✅ (fixed) | `getHomepageTitle` / `getHomepageDescription` |
| `rel=canonical` matches locale prefix | ✅ (fixed for `en-US`) | `buildGlobalHreflang` |
| `hreflang` alternates (19 + x-default) | ✅ | Present in homepage HTML (`hrefLang`) |
| `og:locale` matches page locale | ✅ (fixed) | Was `cs_CZ` for DE/FR/… |
| JSON-LD (`WebSite`, `Organization`, `MedicalWebPage`, apps) | ✅ | Root layout + homepage |
| `<html lang>` | ✅ | Derived from cookie / path locale |
| Search Console / Bing / Yandex property verify meta | ⚠️ ops | Meta hooks in `SEARCH_ENGINE_CONFIG`; tokens must be set in env/dashboard |
| Indexing of thin EN-fallback locales | ⚠️ | Prefer quality translations before pushing crawl budget |

## Fixes landed on this branch

1. **`normalizeLocale`** — Exact/alias match before prefix; `en-US` no longer collapses to `en`. Aliases: `cn`→`zh-CN`, `jp`→`ja`, `kr`→`ko`.
2. **Alias path segments** — `/ja`, `/zh-cn`, `/ko` resolve and **308** to `/jp`, `/cn`, `/kr`.
3. **Dictionary deep-merge** — Thin `de`/`fr`/… files inherit missing keys from `en`/`cs`.
4. **Magazine SEO copy** — Localized homepage claim/subtitle for `de` `fr` `es` `it` `pl` `ja` `zh-CN` (+ `getOgLocale`).
5. **Smoke coverage** — `scripts/i18n-seo-smoke.ts` asserts normalize, aliases, titles, and optional live `/en-us` canonical.

## Remaining gaps (not blocked on this PR)

- Fill `locales/{de,fr,…}/common.json` to parity with `en` (merge makes UI safe; chrome still mostly EN).
- Expand magazine copy for remaining `GLOBAL_LOCALES` (sk, ru, uk, be, ko, vi, id, ro, hu).
- Publish/syndicate articles into non-CS locales so locale sitemaps gain story URLs.
- Confirm Google Search Console property + sitemap submission for `medscopeglobal.com`.
- Root layout default metadata is still EN-leaning; page-level `generateMetadata` overrides the homepage.

## How to re-verify

```bash
pnpm exec tsx scripts/i18n-seo-smoke.ts
MEDSCOPE_ORIGIN=https://medscopeglobal.com pnpm exec tsx scripts/i18n-seo-smoke.ts
pnpm smoke:ecosystem:production
```

Manual probes:

```bash
curl -sI https://medscopeglobal.com/ja          # expect 308 → /jp
curl -sI https://medscopeglobal.com/en-us       # Set-Cookie medscope_locale=en-US
curl -s https://medscopeglobal.com/de | rg -o 'rel="canonical"[^>]+|og:locale[^>]+|<title>[^<]+'
curl -s https://medscopeglobal.com/robots.txt | rg Sitemap
```

## Live production probe (2026-08-27 11:08 UTC)

| Path | Status | Location / cookie | Verdict |
|---|---|---|---|
| `/cs` `/en` `/de` `/jp` `/cn` `/kr` `/sk` `/pl` | 200 | OK | works |
| `/en-us` | 200 | cookie `medscope_locale=en` (should be `en-US`) | **critical** until this branch deploys |
| `/ja` | 307 → `/en/ja` | treated as unprefixed path | **critical** — alias missing on prod |
| `/zh-cn` | 200 | cookie `zh-CN` (should 308 → `/cn`) | partial |
| `/ko` | 200 | cookie `ko` (should 308 → `/kr`) | partial |
| `/robots.txt` `/sitemap-cs.xml` `/sitemap-en-us.xml` | 200 | OK | works |

Fixes in this branch resolve the critical `/ja` and `en-US` cookie/canonical issues after Cloudflare deploy of `main`.

