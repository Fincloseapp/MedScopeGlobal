#!/usr/bin/env node
/**
 * Smoke checks for path-prefix locale routing and SEO endpoints.
 * Run: pnpm exec tsx scripts/i18n-seo-smoke.ts
 * Optional: MEDSCOPE_ORIGIN=http://localhost:3000 (dev server must be running)
 */
import assert from "node:assert/strict";
import {
  buildLocalePath,
  canonicalLocalePathname,
  localeToPathSegment,
  pathSegmentToLocale,
  resolveLocalePath,
  isLocaleRoutingExcluded,
} from "../lib/i18n/locale-path";
import { normalizeLocale } from "../lib/i18n/config";
import { getHomepageTitle, getOgLocale, getMagazineCopy } from "../lib/brand/magazine";
import { buildGlobalHreflang } from "../lib/ecosystem/seo";
import { buildPageMetadata } from "../lib/seo/metadata";
import { allLocaleSitemapUrls } from "../lib/seo/locale-sitemap";
import { GLOBAL_LOCALES, MEDICAL_DISCLAIMER } from "../lib/ecosystem/locales";
import { getPortalUi } from "../lib/i18n/portal-copy";
import { pickCopyLocale } from "../lib/i18n/copy-locale";
import { getMagazineListingUi } from "../lib/i18n/magazine-listing-copy";
import { getDemoArticleTranslation } from "../lib/verejnost/demo-magazine-i18n";
import { getDemoMagazineArticles } from "../lib/verejnost/demo-magazine-articles";
import {
  detectClientLanguage,
  getPreferredLocale,
  PREFERRED_LOCALE_KEY,
  setPreferredLocale,
} from "../lib/i18n/detect-language";

// --- unit checks (no server required) ---
assert.equal(localeToPathSegment("en-US"), "en-us");
assert.equal(localeToPathSegment("zh-CN"), "cn");
assert.equal(localeToPathSegment("ja"), "jp");
assert.equal(pathSegmentToLocale("en-us"), "en-US");
assert.equal(pathSegmentToLocale("cn"), "zh-CN");
assert.equal(pathSegmentToLocale("jp"), "ja");
assert.equal(pathSegmentToLocale("ja"), "ja");
assert.equal(pathSegmentToLocale("zh-cn"), "zh-CN");

assert.equal(normalizeLocale("en-US"), "en-US");
assert.equal(normalizeLocale("en-us"), "en-US");
assert.equal(normalizeLocale("en"), "en");
assert.equal(normalizeLocale("jp"), "ja");
assert.equal(normalizeLocale("cn"), "zh-CN");
assert.equal(canonicalLocalePathname("/ja"), "/jp");
assert.equal(canonicalLocalePathname("/zh-cn/articles"), "/cn/articles");
assert.equal(canonicalLocalePathname("/ko"), "/kr");
assert.equal(canonicalLocalePathname("/de"), null);
assert.ok(getHomepageTitle("de").includes("Gesundheit"));
assert.ok(getHomepageTitle("fr").includes("Santé"));
assert.ok(getHomepageTitle("zh-CN").includes("健康"));
assert.ok(getHomepageTitle("sk").includes("Dlhovekosť") || getHomepageTitle("sk").includes("dlhovekosť"));
assert.ok(getHomepageTitle("ru").includes("долголетие") || getHomepageTitle("ru").includes("Долголетие") || getHomepageTitle("ru").includes("Здоровье"));
assert.ok(getHomepageTitle("ko").includes("건강"));
assert.ok(getHomepageTitle("ro").includes("Sănătate") || getHomepageTitle("ro").includes("longevitate"));
assert.ok(getHomepageTitle("hu").includes("Egészség") || getHomepageTitle("hu").includes("hosszú"));
assert.equal(getOgLocale("de"), "de_DE");
assert.equal(getOgLocale("pl"), "pl_PL");
assert.equal(getOgLocale("fr"), "fr_FR");
assert.equal(getOgLocale("en-US"), "en_US");
assert.equal(getOgLocale("zh-CN"), "zh_CN");
assert.equal(getOgLocale("ja"), "ja_JP");
assert.equal(getOgLocale("sk"), "sk_SK");
assert.equal(getOgLocale("ru"), "ru_RU");
assert.equal(getOgLocale("ko"), "ko_KR");

const deAbout = buildPageMetadata({
  title: "About",
  description: "desc",
  path: "/about",
  locale: "de",
});
assert.equal(deAbout.openGraph?.locale, "de_DE");
assert.equal(deAbout.alternates?.canonical, "https://medscopeglobal.com/de/about");

const plArticles = buildPageMetadata({
  title: "Articles",
  description: "desc",
  path: "/articles",
  locale: "pl",
});
assert.equal(plArticles.openGraph?.locale, "pl_PL");
assert.equal(plArticles.alternates?.canonical, "https://medscopeglobal.com/pl/articles");

const resolved = resolveLocalePath("/de/articles");
assert.equal(resolved.locale, "de");
assert.equal(resolved.pathname, "/articles");

assert.equal(buildLocalePath("cs", "/articles"), "/cs/articles");
assert.equal(buildLocalePath("en-US", "/"), "/en-us");

assert.ok(isLocaleRoutingExcluded("/app/pacient"));
assert.ok(isLocaleRoutingExcluded("/api/locale/set"));
assert.ok(isLocaleRoutingExcluded("/go/mg-cz"));
assert.ok(!isLocaleRoutingExcluded("/articles"));

const hreflang = buildGlobalHreflang("/articles", "de");
assert.equal(hreflang.canonical, "https://medscopeglobal.com/de/articles");
assert.equal(hreflang.languages["de-DE"], "https://medscopeglobal.com/de/articles");
assert.equal(hreflang.languages["cs-CZ"], "https://medscopeglobal.com/cs/articles");
assert.equal(hreflang.languages["x-default"], "https://medscopeglobal.com/cs/articles");
assert.equal(hreflang.languages["en-US"], "https://medscopeglobal.com/en-us/articles");

const sitemaps = allLocaleSitemapUrls();
assert.equal(sitemaps.length, GLOBAL_LOCALES.length);
assert.ok(sitemaps.some((u) => u.endsWith("/sitemap-cs.xml")));
assert.ok(sitemaps.some((u) => u.endsWith("/sitemap-en-us.xml")));

assert.ok(getMagazineCopy("de").eyebrow.includes("Plattform"));
assert.ok(!getMagazineCopy("de").eyebrow.includes("powered by"));
assert.ok(getMagazineCopy("en").eyebrow.includes("powered by"));
assert.ok(getMagazineCopy("fr").tagline.includes("clarté"));
assert.equal(pickCopyLocale("en-US"), "en");
assert.equal(pickCopyLocale("jp"), "ja");
assert.equal(pickCopyLocale("cn"), "zh-CN");
assert.ok(MEDICAL_DISCLAIMER.pl.includes("konsultuj się"));
assert.ok(MEDICAL_DISCLAIMER.it.includes("Consulti sempre"));
assert.equal(getPortalUi("cs").readMagazine, "Číst magazín");
assert.equal(getPortalUi("de").readMagazine, "Magazin lesen");
assert.equal(getPortalUi("pl").readMagazine, "Czytaj magazyn");
assert.equal(getPortalUi("ja").readMagazine, "雑誌を読む");
assert.equal(getPortalUi("zh-CN").readMagazine, "阅读杂志");
assert.ok(!getPortalUi("fr").startWith.includes("powered by"));
for (const loc of GLOBAL_LOCALES) {
  const ui = getPortalUi(loc.code);
  assert.ok(ui.readMagazine.trim().length > 0, `${loc.code} portal chrome missing`);
  assert.ok(ui.trial14.trim().length > 0, `${loc.code} trial CTA missing`);
  if (loc.code !== "en" && loc.code !== "en-US") {
    assert.ok(!ui.footerTagline.includes("powered by"), `${loc.code} leftover English powered by`);
  }
  const listing = getMagazineListingUi(loc.code);
  assert.ok(listing.allFilter.trim().length > 0, `${loc.code} listing chrome missing`);
  assert.ok(listing.relatedReading.trim().length > 0, `${loc.code} related reading missing`);
  const demos = getDemoMagazineArticles(loc.code);
  assert.ok(demos.length >= 7, `${loc.code} demo magazine too short`);
  const sleep = getDemoArticleTranslation("verejnost-zivotni-styl-zdravy-spanek", loc.code);
  assert.ok(sleep?.title, `${loc.code} sleep article missing`);
  if (loc.code === "cs") {
    assert.ok(sleep!.title.includes("spánek") || sleep!.title.includes("Spánek"));
  } else if (loc.code === "de") {
    assert.ok(sleep!.title.includes("Schlaf"));
    assert.ok(!sleep!.title.includes("spánek"));
  } else if (loc.code === "en" || loc.code === "en-US") {
    assert.ok(/sleep/i.test(sleep!.title));
    assert.ok(!sleep!.title.includes("spánek"));
  } else if (loc.code === "pl") {
    assert.ok(/sen/i.test(sleep!.title));
    assert.ok(!sleep!.title.includes("spánek"));
  } else if (loc.code === "ja") {
    assert.ok(sleep!.title.includes("睡眠"));
  } else if (loc.code === "zh-CN") {
    assert.ok(sleep!.title.includes("睡眠"));
  }
}

assert.equal(getMagazineListingUi("de").allFilter, "Alle");
assert.equal(getMagazineListingUi("pl").archive.includes("Archiwum"), true);
assert.ok(getDemoMagazineArticles("de")[0]?.title && !getDemoMagazineArticles("de")[0]!.title.includes("Zdravý"));
assert.ok(getDemoMagazineArticles("en")[0]?.displayLocale === "en");

console.log("✓ i18n/SEO unit checks passed");

// --- optional HTTP smoke (dev server) ---
const origin = process.env.MEDSCOPE_ORIGIN?.replace(/\/$/, "");

async function runHttpSmoke(): Promise<void> {
  if (!origin) {
    console.log("  (skip HTTP smoke — set MEDSCOPE_ORIGIN to run against dev server)");
    return;
  }

  async function fetchStatus(path: string, opts?: RequestInit): Promise<number> {
    const res = await fetch(`${origin}${path}`, {
      redirect: "manual",
      ...opts,
    });
    return res.status;
  }

  const homeRedirect = await fetchStatus("/");
  assert.ok(
    homeRedirect === 307 || homeRedirect === 308 || homeRedirect === 302,
    `/ should redirect (got ${homeRedirect})`
  );

  const csStatus = await fetchStatus("/cs");
  assert.ok(
    csStatus !== 404,
    `/cs should rewrite to app routes (got ${csStatus}, 404 = broken locale routing)`
  );

  for (const path of ["/en-us", "/de", "/jp", "/robots.txt"]) {
    const status = await fetchStatus(path);
    if (path === "/robots.txt") {
      assert.ok(status >= 200 && status < 400, `${path} should be reachable (got ${status})`);
    } else {
      assert.ok(status !== 404, `${path} should rewrite to app routes (got ${status})`);
    }
  }

  const jaAlias = await fetchStatus("/ja");
  assert.ok(
    jaAlias === 308 || jaAlias === 307 || jaAlias === 301,
    `/ja should redirect to canonical /jp (got ${jaAlias})`
  );

  const sitemapStatus = await fetchStatus("/sitemap-cs.xml");
  assert.ok(
    sitemapStatus >= 200 && sitemapStatus < 400,
    `/sitemap-cs.xml should be reachable (got ${sitemapStatus})`
  );

  async function fetchHtml(path: string): Promise<string> {
    const res = await fetch(`${origin}${path}`, { redirect: "follow" });
    return res.text();
  }

  const enUsHtml = await fetchHtml("/en-us");
  assert.ok(
    /rel="canonical"[^>]*href="[^"]*\/en-us"?/i.test(enUsHtml) ||
      /href="[^"]*\/en-us"[^>]*rel="canonical"/i.test(enUsHtml),
    "/en-us canonical should target en-us (not /en)"
  );
  assert.ok(
    /hrefLang="en-US"|hreflang="en-US"/i.test(enUsHtml),
    "/en-us should emit hreflang en-US"
  );

  const deHtml = await fetchHtml("/de");
  assert.ok(
    deHtml.includes("Magazin lesen") || deHtml.includes("Gesundheit"),
    "/de homepage should render German chrome, not Czech-only"
  );
  assert.ok(
    !deHtml.includes("Číst magazín"),
    "/de must not keep Czech hero CTA"
  );

  const deArticles = await fetchHtml("/de/articles");
  assert.ok(
    deArticles.includes("Alle") || deArticles.includes("Magazin"),
    "/de/articles should render German listing chrome"
  );
  assert.ok(
    !deArticles.includes("Číst magazín"),
    "/de/articles must not keep Czech hero CTA"
  );
  assert.ok(
    deArticles.includes("Schlaf") || deArticles.includes("Prävention") || deArticles.includes("Gesunder"),
    "/de/articles should show German article titles, not Czech-only cards"
  );

  const deArticle = await fetchHtml("/de/article/verejnost-zivotni-styl-zdravy-spanek");
  assert.ok(
    deArticle.includes("Schlaf") || deArticle.includes("Gesunder"),
    "/de/article sleep piece should be readable in German"
  );
  assert.ok(
    !/<h1[^>]*>Zdravý spánek/i.test(deArticle),
    "/de/article must not keep Czech H1"
  );

  const enUsArticles = await fetchHtml("/en-us/articles");
  assert.ok(
    /Healthy sleep|Prevention|Healthspan/i.test(enUsArticles),
    "/en-us/articles should show English magazine cards"
  );

  console.log(`✓ HTTP smoke passed against ${origin}`);
}

async function main(): Promise<void> {
  await runHttpSmoke();

  // detect-language uses localStorage — only validate exports exist in Node
  assert.equal(typeof getPreferredLocale, "function");
  assert.equal(typeof setPreferredLocale, "function");
  assert.equal(typeof detectClientLanguage, "function");
  assert.equal(PREFERRED_LOCALE_KEY, "preferredLocale");

  console.log("✓ i18n/SEO smoke complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
