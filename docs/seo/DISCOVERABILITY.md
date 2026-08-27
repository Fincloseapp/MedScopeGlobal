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

| Request | Canonical | Prod (pre-fix) | After fixes (code) | Notes |
|---|---|---|---|---|
| `/cs` | `/cs` | **works** | works | Czech title + description |
| `/en` | `/en` | **works** | works | EN international |
| `/en-us` | `/en-us` | **partial** | works | Was collapsing canonical → `/en` via `normalizeLocale` bug |
| `/de` `/fr` `/es` `/it` `/pl` | same | **partial** | works* | Route + hreflang OK; titles were EN-only → localized claims added |
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
