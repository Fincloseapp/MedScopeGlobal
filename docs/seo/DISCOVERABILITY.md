# MedScopeGlobal — Internet discoverability & locale mutations

Status snapshot from production probes (`https://medscopeglobal.com`) plus code audit on branch `cursor/parallel-seo-i18n-2b2d`.

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
6. **Hreflang** — `buildGlobalHreflang()` emits all 19 `GLOBAL_LOCALES` + `x-default` → `/cs…` via `buildPageMetadata` / homepage `generateMetadata`.

PWAs (`/app/*`), API, admin, and sitemap/robots paths are **excluded** from locale redirects.

## Production locale matrix (homepage) — 2026-08-27

Probed with follow-redirects on `https://medscopeglobal.com`. Status meanings:

- **works** — 200 on canonical segment, locale-aware title (or intentional EN fallback), correct canonical, `og:locale` matches, `<html lang>` sane, full hreflang set (19 + x-default)
- **partial** — route + SEO tags OK, but UI dictionary / homepage title still EN for thin locales
- **broken** — 404 or wrong locale collapse

| Request | HTTP | Cookie | Canonical | `og:locale` | `<html lang>` | Title | Verdict |
|---|---|---|---|---|---|---|---|
| `/cs` | 200 | `cs` | `/cs` | `cs_CZ` | `cs` | CS | **works** |
| `/en` | 200 | `en` | `/en` | `en_US` | `en` | EN | **works** |
| `/en-us` | 200 | `en-US` | `/en-us` | `en_US` | `en` | EN | **works** |
| `/de` | 200 | `de` | `/de` | `de_DE` | `de` | DE | **works** |
| `/pl` | 200 | `pl` | `/pl` | `pl_PL` | `pl` | PL | **works** |
| `/fr` | 200 | `fr` | `/fr` | `fr_FR` | `fr` | FR | **works** |
| `/es` | 200 | `es` | `/es` | `es_ES` | `es` | ES | **works** |
| `/it` | 200 | `it` | `/it` | `it_IT` | `it` | IT | **works** |
| `/sk` | 200 | `sk` | `/sk` | `sk_SK` | `sk` | SK | **works** |
| `/jp` | 200 | `ja` | `/jp` | `ja_JP` | `ja` | JA | **works** |
| `/cn` | 200 | `zh-CN` | `/cn` | `zh_CN` | `zh` | ZH | **works** |
| `/kr` | 200 | `ko` | `/kr` | `ko_KR` | `ko` | KO | **works** |
| `/ru` `/uk` `/be` `/ro` `/hu` `/vi` `/id` | 200 | match | match | match | match | localized title | **works** (UI chrome still thin) |

Hreflang on homepage: **20** links (`hrefLang`, 19 locales + `x-default` → `/cs`).

### Inner routes (pre-fix production bug → fixed on this branch)

| Request | Prod (pre-fix) | After fix | Notes |
|---|---|---|---|
| `/de/articles` `/pl/articles` `/fr/articles` | `og:locale=cs_CZ`, canonical `/articles` (no prefix) | `og` + canonical locale-prefixed | `buildV20PageMetadata` now uses `buildLocalizedV20PageMetadata` → `getServerLocale()` |
| `/de/about` `/de/kontakt` `/pl/o-nas` `/fr/privacy` | `og:locale=cs_CZ`, canonical `/cs/…` | locale-matched | static `export const metadata` → `generateMetadata` + `buildLocalizedPageMetadata` |
| `/de/article/[slug]` | canonical OK, `og:locale` missing (inherit) | `openGraph.locale` set via `getOgLocale` | article detail |

## Robots / sitemaps

| Asset | HTTP | Notes |
|---|---|---|
| `/robots.txt` | 200 | Lists `/sitemap.xml` + 19 locale sitemaps |
| `/sitemap.xml` | 200 | Index present |
| `/sitemap-cs.xml` | 200 | **1018** `<url>` entries |
| `/sitemap-de.xml` `/sitemap-pl.xml` `/sitemap-fr.xml` `/sitemap-en-us.xml` … | 200 | **18** URLs each (static hubs; no non-CS articles yet) |

## SEO checklist (Google-facing)

| Signal | Status | Location |
|---|---|---|
| `robots.txt` allow + multi-bot rules | ✅ | `app/robots.ts` |
| Sitemap index + 19 locale sitemaps | ✅ | `/sitemap.xml`, `/sitemap-{seg}.xml` |
| Per-locale static hubs in sitemaps | ✅ | `lib/seo/locale-sitemap.ts` |
| Czech article volume in `sitemap-cs.xml` | ✅ | ~1000+ URLs on prod |
| Non-CS article syndication in sitemaps | ⚠️ gap | Static-only until `articles.locale` filled |
| Homepage `<title>` / meta description per locale | ✅ | `getHomepageTitle` / `getHomepageDescription` |
| `rel=canonical` matches locale prefix | ✅ | `buildGlobalHreflang` + localized page metadata |
| `hreflang` alternates (19 + x-default) | ✅ | Homepage + localized `buildPageMetadata` |
| `og:locale` matches page locale | ✅ | Homepage + inner routes (this branch) |
| Root `alternateLocale` full set | ✅ | `OG_ALTERNATE_LOCALES` in `lib/seo/metadata.ts` |
| JSON-LD | ✅ | Root layout + homepage + articles |
| `<html lang>` | ✅ | Cookie / path locale |
| Search Console verify meta | ⚠️ ops | Tokens in env/dashboard |

## Fixes on `cursor/parallel-seo-i18n-2b2d`

1. **`buildLocalizedPageMetadata` / `buildLocalizedV20PageMetadata`** — read `medscope_locale` and emit matching `og:locale`, canonical, and hreflang.
2. **Static marketing/legal pages** — converted `export const metadata = buildPageMetadata(…)` to `generateMetadata` so `/de/about` etc. no longer stick to `cs_CZ` / `/cs/…`.
3. **Articles + V20 hubs** — `buildV20PageMetadata` delegates to `buildPageMetadata`; callers await the localized helper.
4. **Article detail** — sets `openGraph.locale` via `getOgLocale(locale)`.
5. **Root layout** — `alternateLocale` lists all global OG locales (not only `cs_CZ`).
6. **Smoke** — `scripts/i18n-seo-smoke.ts` asserts `de`/`pl`/`fr` OG tokens and localized canonicals.

## Remaining gaps

- Fill thin `locales/{…}/common.json` dictionaries (UI chrome still EN for many locales).
- Syndicate articles into non-CS locales so locale sitemaps gain story URLs.
- Confirm GSC / Bing / Yandex sitemap submission.
- Homepage magazine claims localized for all `GLOBAL_LOCALES` (done on `cursor/continue-next-2b2d`).

## How to re-verify

```bash
pnpm exec tsx scripts/i18n-seo-smoke.ts
MEDSCOPE_ORIGIN=https://medscopeglobal.com pnpm exec tsx scripts/i18n-seo-smoke.ts

curl -s https://medscopeglobal.com/de | rg -o 'rel="canonical"[^>]+|og:locale[^>]+|hrefLang="[^"]+"'
curl -s https://medscopeglobal.com/de/articles | rg -o 'rel="canonical"[^>]+|og:locale[^>]+'
curl -s https://medscopeglobal.com/de/about | rg -o 'rel="canonical"[^>]+|og:locale[^>]+'
curl -s https://medscopeglobal.com/robots.txt | rg Sitemap
```
