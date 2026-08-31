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
import { getHomepageTitle, getOgLocale } from "../lib/brand/magazine";
import { buildGlobalHreflang } from "../lib/ecosystem/seo";
import { buildPageMetadata } from "../lib/seo/metadata";
import { allLocaleFeedUrls, allLocaleSitemapUrls, localeArticleUrl } from "../lib/seo/locale-sitemap";
import { GLOBAL_LOCALES } from "../lib/ecosystem/locales";
import {
  detectClientLanguage,
  getPreferredLocale,
  PREFERRED_LOCALE_KEY,
  setPreferredLocale,
} from "../lib/i18n/detect-language";
import { detectLocaleFromAcceptLanguage } from "../lib/i18n/detect-locale";
import { isSearchEngineBot } from "../lib/i18n/search-bots";
import { newsDesksForLocale } from "../lib/v271/news-desks";
import { getPortalChrome } from "../lib/v271/portal";
import { getSurfaceCopy, isCzechSurface } from "../lib/i18n/surface-copy";
import { getSubscribeCopy } from "../lib/i18n/subscribe-copy";
import { getMarketingCopy } from "../lib/i18n/marketing-copy";
import { localizePublicHref } from "../lib/i18n/nav-copy";
import { localizeV271Page } from "../lib/i18n/hub-copy";
import { getDesktopHeaderMenu } from "../lib/config/main-navigation";
import { V271_LEKARI_PAGES } from "../lib/v271/routes";

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
assert.ok(getHomepageTitle("de").includes("ViaLongeVita"));
assert.ok(getHomepageTitle("de").includes("Gesundheit"));
assert.ok(getHomepageTitle("fr").includes("Santé"));
assert.ok(getHomepageTitle("zh-CN").includes("健康"));
assert.ok(getHomepageTitle("sk").includes("Dlhovekosť") || getHomepageTitle("sk").includes("dlhovekosť"));
assert.ok(getHomepageTitle("ru").includes("долголетие") || getHomepageTitle("ru").includes("Долголетие") || getHomepageTitle("ru").includes("Здоровье"));
assert.ok(getHomepageTitle("ko").includes("건강"));
assert.ok(getHomepageTitle("ro").includes("Sănătate") || getHomepageTitle("ro").includes("longevitate"));
assert.ok(getHomepageTitle("hu").includes("Egészség") || getHomepageTitle("hu").includes("hosszúélet"));
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
assert.ok(sitemaps.some((u) => u.endsWith("/sitemap-de.xml")));

const feeds = allLocaleFeedUrls();
assert.equal(feeds.length, GLOBAL_LOCALES.length);
assert.ok(feeds.some((u) => u.endsWith("/feed-de.xml")));

assert.equal(
  localeArticleUrl("https://medscopeglobal.com", "de", "osteoporoza-po-50"),
  "https://medscopeglobal.com/de/article/osteoporoza-po-50"
);
assert.ok(
  localeArticleUrl(
    "https://medscopeglobal.com",
    "fr",
    "verejnost-rozhovory-2026-07-03-cesta-zpet-k-zivotu-pribeh-mudr-novaka-po-infarktu"
  ).includes("pribeh-lekare-po-infarktu")
);

assert.equal(detectLocaleFromAcceptLanguage("de-DE,de;q=0.9,en;q=0.8"), "de");
assert.equal(detectLocaleFromAcceptLanguage("fr-FR,fr;q=0.9"), "fr");
assert.equal(detectLocaleFromAcceptLanguage("en-US,en;q=0.8"), "en-US");
assert.ok(isSearchEngineBot("Mozilla/5.0 (compatible; Googlebot/2.1)"));
assert.ok(isSearchEngineBot("SeznamBot/3.0"));
assert.ok(isSearchEngineBot("YandexBot/3.0"));
assert.equal(isSearchEngineBot("Mozilla/5.0 (iPhone)"), false);
assert.ok(isLocaleRoutingExcluded("/feed/de"));
assert.ok(isLocaleRoutingExcluded("/sitemap-de.xml"));
assert.ok(isLocaleRoutingExcluded("/api/health"));

const deDesks = newsDesksForLocale("de");
assert.equal(deDesks.find((d) => d.id === "dlouhovekost")?.label, "Langlebigkeit");
assert.equal(newsDesksForLocale("cs").find((d) => d.id === "dlouhovekost")?.label, "Dlouhověkost");
assert.equal(getPortalChrome("de").newsTabs[0]?.label, "News");
assert.equal(getPortalChrome("fr").trialCta.includes("14"), true);
assert.ok(getPortalChrome("de").footerLegal.includes("Langlebigkeit"));
assert.equal(getPortalChrome("sk").forWhom, "Who it's for");
assert.equal(getPortalChrome("ru").trialCta, "14 days free");
assert.equal(getPortalChrome("ja").news, "Newsroom");

assert.equal(getSurfaceCopy("cs").searchTab, "Hledat");
assert.equal(getSurfaceCopy("de").searchTab, "Suchen");
assert.equal(getSurfaceCopy("fr").searchTab, "Rechercher");
assert.equal(getSurfaceCopy("en-US").searchTab, "Search");
assert.equal(getSurfaceCopy("ru").searchTab, "Search");
assert.equal(getSurfaceCopy("ja").searchTab, "Search");
assert.equal(getSurfaceCopy("sk").writersTitle, "Editorial desks");
assert.equal(getSurfaceCopy("pl").why[0]?.title.includes("Magazine"), true);
assert.equal(isCzechSurface("cs"), true);
assert.equal(isCzechSurface("de"), false);
assert.ok(!getSurfaceCopy("de").footer.tagline.includes("v češtině"));
assert.ok(!getSurfaceCopy("fr").footer.evidence.includes("češtině"));
assert.equal(getSurfaceCopy("de").appTaglines.ordizapis.includes("OrdiZapis"), true);
assert.equal(newsDesksForLocale("ru")[0]?.label, "News");
assert.ok(!getSurfaceCopy("de").siteDescription.includes("14 dní"));
assert.ok(getSurfaceCopy("de").siteDescription.includes("14 Tage"));
assert.equal(getSurfaceCopy("de").cookieTitle, "Cookies und Datenschutz");
assert.equal(getSurfaceCopy("sk").cookieTitle, "Cookies and privacy");
assert.equal(getSurfaceCopy("fr").mainNav, "Navigation principale");
assert.equal(getSurfaceCopy("fr").signIn, "Connexion");
assert.equal(getSurfaceCopy("fr").register, "Inscription");
assert.equal(getSurfaceCopy("de").signIn, "Anmelden");
assert.equal(getSubscribeCopy("fr").title, "Accès premium aux contenus médicaux");
assert.ok(!getSubscribeCopy("fr").title.includes("Předplatné"));
assert.ok(!getSubscribeCopy("de").faqTitle.includes("Časté"));
assert.equal(getSubscribeCopy("sk").eyebrow, "Subscription");
assert.equal(localizePublicHref("/predplatne", "fr"), "/fr/predplatne");
assert.equal(localizePublicHref("/predplatne?trial=1", "de"), "/de/predplatne?trial=1");
assert.equal(localizePublicHref("/app/pacient", "fr"), "/app/pacient");

const csHeader = getDesktopHeaderMenu("cs");
const frHeader = getDesktopHeaderMenu("fr");
assert.equal(csHeader.length, 5);
assert.equal(frHeader.length, 5);
assert.deepEqual(
  csHeader.map((item) => item.href.replace(/^\/cs(?=\/)/, "")),
  ["/verejnost", "/studenti", "/lekari", "/aplikace", "/predplatne"]
);
assert.deepEqual(
  frHeader.map((item) => item.href),
  ["/fr/verejnost", "/fr/studenti", "/fr/lekari", "/fr/aplikace", "/fr/predplatne"]
);
assert.equal(frHeader[0]?.label, "Grand public");
assert.equal(frHeader[4]?.label, "Abonnement");
assert.equal(getDesktopHeaderMenu("de")[2]?.label, "Ärzte");
assert.equal(getMarketingCopy("fr").apps.title, "Applis");
assert.ok(!getMarketingCopy("fr").apps.trialCta.includes("zdarma"));
assert.equal(getMarketingCopy("de").about.eyebrow, "Über uns");
assert.equal(getMarketingCopy("sk").publicHub.title.includes("plain"), true);

const frLekari = localizeV271Page(V271_LEKARI_PAGES.index, "lekari", "fr");
assert.equal(frLekari.sectionLabel, "Médecins");
assert.ok(frLekari.page.title.includes("médecins") || frLekari.page.title.includes("Médecins") || frLekari.page.title.includes("chercheurs"));
assert.ok(!frLekari.page.title.includes("lékaře"));
assert.ok(frLekari.page.links.some((l) => l.href.startsWith("/fr/")));

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
