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
import {
  detectLocaleFromAcceptLanguage,
  localeForUnprefixedEntry,
} from "../lib/i18n/detect-locale";
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
import { looksLikeCzech } from "../lib/i18n/czech-detect";
import { paymentTiersForUser } from "../lib/i18n/payment-currency";
import { formatPublicDate, intlLocaleFor } from "../lib/i18n/format-date";
import { getArticleChrome } from "../lib/i18n/article-chrome";
import { tipLocale, ARTICLE_TIP_COPY } from "../lib/ecosystem/tip-copy";
import { publicEditorialByline } from "../lib/editorial/units";
import { getVerejnostChrome } from "../lib/i18n/verejnost-chrome";
import { topicLabelForSlug } from "../lib/config/verejnost-topics";
import { localizeMagazineHubConfig } from "../lib/i18n/localize-magazine-hub";
import { OSVETA_MAGAZINE_HUB } from "../lib/portal/magazine-section-hub";

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
assert.equal(detectLocaleFromAcceptLanguage("cs-CZ,cs;q=0.9,en;q=0.5"), "cs");
assert.equal(detectLocaleFromAcceptLanguage("cs; q=0.9,en; q=0.8"), "cs");
assert.equal(detectLocaleFromAcceptLanguage("de-AT,de;q=0.9"), "de");
assert.equal(detectLocaleFromAcceptLanguage("en-GB,en;q=0.9"), "en-UK");
assert.equal(detectLocaleFromAcceptLanguage("zh-CN,zh;q=0.8"), "zh-CN");
assert.equal(detectLocaleFromAcceptLanguage("zh,en;q=0.5"), "zh-CN");
assert.equal(detectLocaleFromAcceptLanguage("sk-SK,sk;q=0.9"), "sk");
assert.equal(detectLocaleFromAcceptLanguage("pl-PL,pl;q=0.9,cs;q=0.4"), "pl");
assert.equal(detectLocaleFromAcceptLanguage("sv-SE,sv;q=0.9,en;q=0.8"), "en");
assert.equal(detectLocaleFromAcceptLanguage(""), "cs");
assert.equal(localeForUnprefixedEntry("cs-CZ,cs;q=0.9", false), "cs");
assert.equal(localeForUnprefixedEntry("de-DE,de;q=0.9", false), "de");
assert.equal(localeForUnprefixedEntry("fr-FR", false), "fr");
assert.equal(localeForUnprefixedEntry("de-DE", true), "cs");
assert.equal(localizePublicHref("/", "fr"), "/fr");
assert.equal(localizePublicHref("/", "cs"), "/cs");
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

assert.equal(looksLikeCzech("Duševní pohoda je důležitá"), true);
assert.equal(looksLikeCzech("Santé mentale : quand demander de l’aide ?"), false);
assert.equal(paymentTiersForUser("cs").currency, "czk");
assert.equal(paymentTiersForUser("fr").currency, "eur");
assert.equal(paymentTiersForUser("de").currency, "eur");
assert.equal(paymentTiersForUser("en-US").currency, "usd");
assert.equal(paymentTiersForUser("en-UK").currency, "gbp");
assert.equal(paymentTiersForUser("sk").currency, "eur");
assert.equal(paymentTiersForUser("cs", "EU").currency, "czk");
assert.equal(paymentTiersForUser("fr", "USA").currency, "eur");
assert.equal(paymentTiersForUser("en-US", "EU").currency, "usd");
assert.equal(intlLocaleFor("cs"), "cs-CZ");
assert.equal(intlLocaleFor("fr"), "fr-FR");
assert.equal(intlLocaleFor("de"), "de-DE");
assert.equal(intlLocaleFor("en-US"), "en-US");
const frDate = formatPublicDate("2026-08-28T12:00:00.000Z", "fr");
assert.ok(frDate && !/srpna|srpen/i.test(frDate), `FR date must not be Czech (got ${frDate})`);
assert.ok(!looksLikeCzech(frDate ?? ""), `FR date leaked Czech: ${frDate}`);
const csDate = formatPublicDate("2026-08-28T12:00:00.000Z", "cs");
assert.ok(csDate && /srpna|8/i.test(csDate), `CS date should stay Czech (got ${csDate})`);
assert.equal(tipLocale("fr"), "fr");
assert.equal(tipLocale("cs"), "cs");
assert.ok(!ARTICLE_TIP_COPY[tipLocale("fr")].tipSection.includes("Příspěvek"));
assert.equal(ARTICLE_TIP_COPY.cs.tipSection, "Příspěvek");
assert.equal(publicEditorialByline("fr"), "Rédaction MedScopeGlobal");
assert.equal(publicEditorialByline("cs"), "Redakce MedScopeGlobal");
assert.ok(!publicEditorialByline("de").includes("Redakce"));
assert.equal(getArticleChrome("cs").save, "Uložit");
assert.equal(getArticleChrome("fr").save, "Enregistrer");
assert.equal(getArticleChrome("de").share, "Teilen");
assert.ok(!getArticleChrome("fr").related.includes("Související"));
assert.ok(!getArticleChrome("en").recsTitle.includes("dlouhověkost"));

assert.equal(topicLabelForSlug("zivotni-styl", "cs"), "Životní styl");
assert.equal(topicLabelForSlug("zivotni-styl", "fr"), "Lifestyle");
assert.equal(topicLabelForSlug("zivotni-styl", "de"), "Lifestyle");
assert.equal(topicLabelForSlug("dlouhovekost", "en"), "Longevity");
assert.equal(getVerejnostChrome("cs").dailyTipBadge, "Dnešní tip");
assert.equal(getVerejnostChrome("fr").dailyTipBadge, "Conseil du jour");
assert.equal(getVerejnostChrome("de").dailyTipBadge, "Tipp des Tages");
assert.ok(!looksLikeCzech(getVerejnostChrome("fr").dailyVideoEyebrow));
assert.ok(!looksLikeCzech(getVerejnostChrome("de").interviewBadge));
assert.equal(getVerejnostChrome("cs").interviewBadge, "Rozhovor");
assert.ok(!looksLikeCzech(getVerejnostChrome("fr").hubs.osveta.title));
assert.ok(!looksLikeCzech(getVerejnostChrome("de").hubs.clanky.heroDeck));
const frOsvetaHub = localizeMagazineHubConfig(OSVETA_MAGAZINE_HUB, "fr");
assert.ok(!looksLikeCzech(frOsvetaHub.title), `FR osveta hub title leaked Czech: ${frOsvetaHub.title}`);
assert.ok(!looksLikeCzech(frOsvetaHub.heroDeck));
assert.ok(frOsvetaHub.primaryCta.href.startsWith("/fr/") || frOsvetaHub.primaryCta.href.startsWith("#"));
assert.ok(frOsvetaHub.secondaryCtas.every((cta) => !looksLikeCzech(cta.label)));
assert.ok(frOsvetaHub.pillars.every((p) => !looksLikeCzech(p.label)));
const csOsvetaHub = localizeMagazineHubConfig(OSVETA_MAGAZINE_HUB, "cs");
assert.ok(csOsvetaHub.title.includes("osvěta") || csOsvetaHub.title.includes("Osvěta") || /osvěta/i.test(csOsvetaHub.title));

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

  async function fetchRedirect(path: string, headers: HeadersInit): Promise<Response> {
    return fetch(`${origin}${path}`, { redirect: "manual", headers });
  }

  const czechDevice = await fetchRedirect("/", {
    "Accept-Language": "cs-CZ,cs;q=0.9,en;q=0.5",
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
  });
  assert.equal(czechDevice.status, 302);
  assert.match(czechDevice.headers.get("location") ?? "", /\/cs\/?$/);
  assert.match(czechDevice.headers.get("vary") ?? "", /Accept-Language/i);

  const germanDevice = await fetchRedirect("/", {
    "Accept-Language": "de-DE,de;q=0.9",
    "User-Agent": "Mozilla/5.0 (Linux; Android 14)",
    Cookie: "medscope_locale=en-US; medscope_locale_manual=1",
  });
  assert.equal(germanDevice.status, 302);
  assert.match(germanDevice.headers.get("location") ?? "", /\/de\/?$/);

  const googlebot = await fetchRedirect("/", {
    "Accept-Language": "de-DE",
    "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  });
  assert.ok(googlebot.status === 308 || googlebot.status === 301);
  assert.match(googlebot.headers.get("location") ?? "", /\/cs\/?$/);

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
