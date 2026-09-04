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
import { articleJsonLdGlobal, buildGlobalHreflang } from "../lib/ecosystem/seo";
import { renderLlmsTxt } from "../lib/seo/llms-txt";
import { buildPageMetadata } from "../lib/seo/metadata";
import { allLocaleFeedUrls, allLocaleSitemapUrls, localeArticleUrl } from "../lib/seo/locale-sitemap";
import { buildRootSitemapStaticEntries } from "../lib/seo/root-sitemap";
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
import { isListableNewsArticle, newsDesksForLocale } from "../lib/v271/news-desks";
import { getPortalChrome } from "../lib/v271/portal";
import {
  getSurfaceCopy,
  isCzechSurface,
  writerAgentsForLocale,
  writerDesksForLocale,
} from "../lib/i18n/surface-copy";
import { getSubscribeCopy } from "../lib/i18n/subscribe-copy";
import { getNewsletterCopy } from "../lib/i18n/newsletter-copy";
import { getMarketingCopy } from "../lib/i18n/marketing-copy";
import { localizePublicHref } from "../lib/i18n/nav-copy";
import { localizeV271Page } from "../lib/i18n/hub-copy";
import { getDesktopHeaderMenu } from "../lib/config/main-navigation";
import { V271_LEKARI_PAGES } from "../lib/v271/routes";
import { looksLikeCzech } from "../lib/i18n/czech-detect";
import { convertCzkToCharge, localizeListedCzk, paymentTiersForUser } from "../lib/i18n/payment-currency";
import { studentIntroCharge, studentMonthlyCharge } from "../lib/studenti/pricing";
import { b2bPricingForLocale } from "../lib/v271/b2b-pricing";
import { formatPublicDate, intlLocaleFor } from "../lib/i18n/format-date";
import { getArticleChrome } from "../lib/i18n/article-chrome";
import { getRevenueCopy } from "../lib/i18n/revenue-copy";
import { getB2BLandingCopy } from "../lib/i18n/b2b-landing-copy";
import { chromePack } from "../lib/i18n/chrome-pack";
import { getV27AudienceGridCopy, getV27AudienceHubCopy } from "../lib/i18n/v27-audience-copy";
import { mergeNativeDeskFeed, nativeDeskArticlesForLocale, nativeDeskPinDate, relatedNativeDeskArticles } from "../lib/editorial/native-desk-articles";
import { getPhysicianLandingCopy } from "../lib/i18n/physician-landing-copy";
import { getOrdiZaznamCopy } from "../lib/i18n/ordizaznam-copy";
import { getDokumentaceCopy } from "../lib/i18n/dokumentace-copy";
import { getOrdiZapisAppCopy } from "../lib/i18n/ordizapis-app-copy";
import { getOrdiZapisApiCopy } from "../lib/i18n/ordizapis-api-copy";
import {
  dokumentaceNoteLanguage,
  sttPromptFor,
  structureSystemPrompt,
} from "../lib/lekari/dokumentace/note-language";
import { getMedipacientCopy } from "../lib/i18n/medipacient-copy";
import { getMediflowCopy } from "../lib/i18n/mediflow-copy";
import { getInstallPwaCopy } from "../lib/i18n/install-pwa-copy";
import { getB2bPublicCopy } from "../lib/i18n/b2b-public-copy";
import { czechFacultyProductForPath, getCzechFacultyOnlyCopy, isCzechFacultyLocale } from "../lib/i18n/czech-faculty-only-copy";
import { getPhysicianHubExtrasCopy } from "../lib/i18n/physician-hub-extras-copy";
import { tipLocale, ARTICLE_TIP_COPY } from "../lib/ecosystem/tip-copy";
import { formatSyndicatedByline, publicEditorialByline } from "../lib/editorial/units";
import { filterArticlesForLocale } from "../lib/i18n/filter-articles-for-locale";
import {
  geopoliticalDeskBrief,
  isCzechOnlyInstitutional,
  isShareableMagazineTopic,
} from "../lib/editorial/geopolitical-topics";
import { localRegulatorShort } from "../lib/i18n/local-regulator";
import { buildNativeLocalePrompt } from "../lib/v25/writers/native-locale-brief.mjs";
import { getVerejnostChrome } from "../lib/i18n/verejnost-chrome";
import { topicLabelForSlug } from "../lib/config/verejnost-topics";
import { localizeMagazineHubConfig } from "../lib/i18n/localize-magazine-hub";
import { getClankyMagazineHub, OSVETA_MAGAZINE_HUB } from "../lib/portal/magazine-section-hub";
import { getVerejnostNavStripCopy } from "../lib/v38/conversion-copy";
import { getHomepageLongevityCopy } from "../lib/i18n/homepage-longevity";
import { classifyCoverTopic } from "../lib/ecosystem/editorial/images/cover";

// --- unit checks (no server required) ---
assert.equal(localeToPathSegment("en-US"), "en-us");
assert.equal(localeToPathSegment("en-UK"), "en-uk");
assert.equal(pathSegmentToLocale("en-uk"), "en-UK");
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

const rootStatic = buildRootSitemapStaticEntries("https://medscopeglobal.com");
assert.ok(rootStatic.some((row) => row.url === "https://medscopeglobal.com/en-us/articles"));
assert.ok(rootStatic.some((row) => row.url === "https://medscopeglobal.com/it/predplatne"));
assert.ok(!rootStatic.some((row) => row.url === "https://medscopeglobal.com/articles"));
assert.ok(!rootStatic.some((row) => row.url.includes("/cs/article/")));
assert.ok(rootStatic.some((row) => row.url === "https://medscopeglobal.com/cs/studenti"));
assert.ok(rootStatic.some((row) => row.url === "https://medscopeglobal.com/en-us/studenti"));
assert.ok(rootStatic.some((row) => row.url === "https://medscopeglobal.com/de/studenti/darkove"));
assert.ok(!rootStatic.some((row) => row.url === "https://medscopeglobal.com/de/mediprep"));

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
assert.equal(localeForUnprefixedEntry("en-US,en;q=0.8", false, "US"), "en-US");
assert.equal(localeForUnprefixedEntry("en", false, "US"), "en-US");
assert.equal(localeForUnprefixedEntry("en", false, "GB"), "en-UK");
assert.equal(localeForUnprefixedEntry("cs-CZ,cs;q=0.9", false, "US"), "cs");
assert.equal(localeForUnprefixedEntry("", false, "US"), "en-US");
assert.equal(localeForUnprefixedEntry("", false, "CZ"), "cs");
assert.equal(localeForUnprefixedEntry("de-DE", false, "US"), "de");
assert.equal(localeForUnprefixedEntry("en-GB,en;q=0.9", false, "US"), "en-UK");
assert.equal(localeForUnprefixedEntry("de-DE", true, "US"), "cs");
assert.equal(localeForUnprefixedEntry("pt-PT,pt;q=0.9", false), "pt");
assert.equal(localeForUnprefixedEntry("pt-BR,pt;q=0.9", false), "pt-BR");
assert.equal(localeForUnprefixedEntry("", false, "PT"), "pt");
assert.equal(localeForUnprefixedEntry("", false, "BR"), "pt-BR");
assert.equal(localeToPathSegment("pt-BR"), "pt-br");
assert.equal(pathSegmentToLocale("pt-br"), "pt-BR");
assert.ok(!getNewsletterCopy("pt").body.includes("češtině"));
assert.ok(!getNewsletterCopy("de").body.includes("češtině"));
assert.equal(localizePublicHref("/", "fr"), "/fr");
assert.equal(localizePublicHref("/", "cs"), "/cs");
assert.ok(isSearchEngineBot("Mozilla/5.0 (compatible; Googlebot/2.1)"));
assert.ok(isSearchEngineBot("SeznamBot/3.0"));
assert.ok(isSearchEngineBot("YandexBot/3.0"));
assert.ok(isSearchEngineBot("Mozilla/5.0 AppleWebKit/537.36 (compatible; GPTBot/1.2)"));
assert.ok(isSearchEngineBot("PerplexityBot/1.0"));
assert.ok(isSearchEngineBot("ClaudeBot/1.0"));
assert.equal(isSearchEngineBot("Mozilla/5.0 (iPhone)"), false);
assert.ok(isLocaleRoutingExcluded("/llms.txt"));
assert.ok(isLocaleRoutingExcluded("/news-sitemap.xml"));
assert.ok(isLocaleRoutingExcluded("/feed/de"));
assert.ok(isLocaleRoutingExcluded("/sitemap-de.xml"));
assert.ok(isLocaleRoutingExcluded("/api/health"));
assert.ok(isLocaleRoutingExcluded("/__ms/js"));
assert.ok(isLocaleRoutingExcluded("/__ms/g/collect"));
assert.ok(isLocaleRoutingExcluded("/relay/js"));
assert.ok(isLocaleRoutingExcluded("/relay/g/collect"));

const deDesks = newsDesksForLocale("de");
assert.equal(deDesks.find((d) => d.id === "dlouhovekost")?.label, "Langlebigkeit");
assert.equal(newsDesksForLocale("cs").find((d) => d.id === "dlouhovekost")?.label, "Dlouhověkost");
assert.equal(getPortalChrome("de").newsTabs[0]?.label, "Nachrichten");
assert.equal(getPortalChrome("fr").trialCta.includes("14"), true);
assert.ok(getPortalChrome("de").footerLegal.includes("Langlebigkeit"));
assert.equal(getPortalChrome("sk").forWhom, "Who it's for");
assert.equal(getPortalChrome("ru").trialCta, "Try 14 days free");
assert.equal(getPortalChrome("ja").news, "ViaLongeVita");

assert.equal(getSurfaceCopy("cs").searchTab, "Hledat");
assert.equal(getSurfaceCopy("de").searchTab, "Suchen");
assert.ok(!getSurfaceCopy("de").searchNoResults.includes("MeDiprep"));
assert.ok(!getSurfaceCopy("de").audiences.some((item) => item.id === "student"));
assert.ok(!getSurfaceCopy("fr").footer.audiences.some((item) => item.href.startsWith("/studenti")));
assert.ok(getSurfaceCopy("cs").searchNoResults.includes("MeDiprep"));
assert.equal(getSurfaceCopy("fr").searchTab, "Rechercher");
assert.equal(getSurfaceCopy("en-US").searchTab, "Search");
assert.equal(getSurfaceCopy("ru").searchTab, "Search");
assert.equal(getSurfaceCopy("ja").searchTab, "Search");
assert.equal(getSurfaceCopy("sk").writersTitle, "Editorial desks");
assert.equal(writerDesksForLocale("cs").length, 5);
assert.equal(writerAgentsForLocale("cs").length, 20);
assert.equal(writerAgentsForLocale("de").length, 20);
assert.ok(writerAgentsForLocale("cs")[0]?.label.includes("Životní styl"));
assert.ok(writerAgentsForLocale("en")[0]?.label.includes("Lifestyle"));
assert.ok(!writerAgentsForLocale("de").some((agent) => /Životní/.test(agent.label)));
assert.ok(!writerAgentsForLocale("fr").some((agent) => /Životní/.test(agent.label)));
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
assert.equal(getSubscribeCopy("fr").title, "La longévité en clair — 14 jours d’essai");
assert.ok(!getSubscribeCopy("fr").title.includes("Předplatné"));
assert.ok(!getSubscribeCopy("cs").title.includes("Prémiový"));
assert.ok(getSubscribeCopy("de").supportTitle.includes("weiterlesen"));
assert.ok(!getSubscribeCopy("en").parentsMore.includes("/studenti"));
assert.ok(getSubscribeCopy("fr").afterTrialUnit.includes("mois"));
assert.ok(!getSubscribeCopy("de").faqTitle.includes("Časté"));
assert.equal(getSubscribeCopy("sk").eyebrow, "Subscription");
assert.equal(localizePublicHref("/predplatne", "fr"), "/fr/predplatne");
assert.equal(localizePublicHref("/predplatne?trial=1", "de"), "/de/predplatne?trial=1");
assert.equal(localizePublicHref("/app/pacient", "fr"), "/app/pacient");

const csHeader = getDesktopHeaderMenu("cs");
const frHeader = getDesktopHeaderMenu("fr");
assert.equal(csHeader.length, 5);
assert.equal(frHeader.length, 4);
assert.deepEqual(
  csHeader.map((item) => item.href.replace(/^\/cs(?=\/)/, "")),
  ["/verejnost", "/studenti", "/lekari", "/aplikace", "/predplatne"]
);
assert.deepEqual(
  frHeader.map((item) => item.href),
  ["/fr/verejnost", "/fr/lekari", "/fr/aplikace", "/fr/predplatne"]
);
assert.equal(frHeader[0]?.label, "Grand public");
assert.equal(frHeader[3]?.label, "Abonnement");
assert.equal(getDesktopHeaderMenu("de")[1]?.label, "Ärzte");
assert.ok(!getDesktopHeaderMenu("de").some((item) => item.href.includes("/studenti")));
assert.equal(csHeader[0]?.children?.[0]?.href.includes("dlouhovekost"), true);
assert.equal(csHeader[0]?.children?.[0]?.label, "Dlouhověkost");
assert.equal(frHeader[0]?.children?.[0]?.label, "Longévité");
assert.equal(getDesktopHeaderMenu("de")[0]?.children?.[0]?.label, "Langlebigkeit");
assert.ok((frHeader[3]?.children?.length ?? 0) >= 4);
assert.ok(getPortalChrome("cs").trialCta.includes("zdarma"));
assert.ok(getPortalChrome("fr").services.some((s) => s.id === "vip" && s.label === "Longévité"));
assert.equal(getPortalChrome("cs").services.find((s) => s.id === "leky")?.label, "Léky");
assert.equal(getPortalChrome("cs").services.find((s) => s.id === "ai")?.hint, "zeptat se");
assert.ok(!getPortalChrome("cs").services.some((s) => s.label === "Drugs" || s.hint === "ask"));
assert.deepEqual(
  getPortalChrome("cs").newsTabs.map((tab) => tab.label),
  ["Aktuality", "Veřejnost", "Dlouhověkost", "Články"]
);
assert.equal(getSurfaceCopy("cs").searchPlaceholder.includes("Dlouhověkost"), true);
assert.ok(!getSurfaceCopy("cs").searchPlaceholder.includes("Longevity"));
assert.ok(!getSurfaceCopy("cs").trending.some((item) => /VIP/i.test(item.label)));
assert.equal(getMarketingCopy("de").publicHub.topics["zivotni-styl"]?.label, "Lebensstil");
assert.equal(getMarketingCopy("fr").publicHub.topics["zivotni-styl"]?.label, "Mode de vie");
assert.ok(getHomepageLongevityCopy("cs").title.includes("kroky"));
assert.ok(getHomepageLongevityCopy("fr").softCta.includes("14"));
assert.ok(!getHomepageLongevityCopy("de").closer.includes("zdarma"));
assert.equal(classifyCoverTopic({ title: "Mediterranean diet at home", slug: "mediterranean-diet" }), "food");
assert.equal(classifyCoverTopic({ title: "Sommeil et rythme circadien", slug: "sommeil-rythme" }), "sleep");
assert.equal(classifyCoverTopic({ title: "Langlebigkeit und Healthspan", slug: "langlebigkeit-healthspan" }), "seniors");
assert.equal(classifyCoverTopic({ title: "WHO and EMA guideline on air quality", slug: "who-ema-guideline" }), "research");
assert.equal(
  classifyCoverTopic({
    title: "Rozhovor: jak pečovat o klidný podvečer",
    slug: "verejnost-rozhovory-klidny-podvecer",
    publicTopic: "rozhovory",
  }),
  "calm"
);
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
const csCharge = convertCzkToCharge(99, "cs");
assert.equal(csCharge.currency, "czk");
assert.equal(csCharge.unitAmount, 9900);
assert.ok(csCharge.formatted.includes("Kč") || csCharge.formatted.includes("CZK"));
const frCharge = convertCzkToCharge(99, "fr");
assert.equal(frCharge.currency, "eur");
assert.equal(frCharge.unitAmount, 396);
assert.ok(frCharge.formatted.includes("€") || frCharge.formatted.toLowerCase().includes("eur"));
const deCharge = convertCzkToCharge(149, "de");
assert.equal(deCharge.currency, "eur");
assert.equal(studentMonthlyCharge("de").unitAmount, 1000);
assert.equal(studentMonthlyCharge("cs").unitAmount, 14900);
assert.equal(studentIntroCharge("cs").unitAmount, 8900);
assert.equal(studentIntroCharge("de").unitAmount, 600);
assert.equal(convertCzkToCharge(99, "en-US").currency, "usd");
assert.equal(convertCzkToCharge(99, "en-UK").currency, "gbp");
assert.equal(convertCzkToCharge(99, "ja").currency, "jpy");
assert.ok(convertCzkToCharge(99, "ja").unitAmount >= 1);
assert.equal(convertCzkToCharge(99, "fr", "USA").currency, "eur");
assert.ok(!localizeListedCzk("149 CZK = Academy student", "fr").includes("CZK"));
assert.ok(!localizeListedCzk("OrdiZapis (390 CZK)", "de").includes("CZK"));
assert.ok(!localizeListedCzk("3 500 Kč", "de").includes("Kč"));
assert.ok(!localizeListedCzk("5 000 Kč", "de").includes("Kč"));
assert.ok(!localizeListedCzk("od 8 000 Kč", "de").includes("Kč"));
assert.ok(localizeListedCzk("149 Kč = Student LF", "cs").includes("Kč"));
assert.ok(getPortalChrome("cs").news.includes("ViaLongeVita"));
assert.ok(getPortalChrome("de").news.includes("ViaLongeVita"));
assert.ok(getHomepageLongevityCopy("de").eyebrow.includes("ViaLongeVita"));
assert.ok(!getSubscribeCopy("fr").metaDescription.includes("CZK"));
assert.ok(!getSubscribeCopy("fr").metaDescription.includes("Kč"));
assert.ok(!getSubscribeCopy("fr").comparisonLead.includes("CZK"));
assert.ok(!getSubscribeCopy("fr").faq.some((item) => /CZK|Kč/.test(item.a)));
assert.ok(!getSubscribeCopy("de").plans.student.features.some((line) => /CZK|Kč/.test(line)));
assert.ok(!getSubscribeCopy("fr").comparisonRows.some((row) => /CZK|Kč/.test(row)));
assert.ok(getSubscribeCopy("cs").metaDescription.includes("Kč"));
assert.ok(!getSubscribeCopy("fr").afterTrialUnit.includes("CZK"));
assert.ok(!getVerejnostNavStripCopy("fr").body.includes("CZK"));
assert.ok(!getMarketingCopy("de").students.priceLine.includes("CZK"));
const frHeaderKids = getDesktopHeaderMenu("fr").flatMap((item) => item.children ?? []);
assert.equal(
  frHeaderKids.find((child) => child.href.includes("/studenti") || child.href.includes("/mediprep")),
  undefined
);
const frStudentPlan = frHeaderKids.find((child) => child.href.includes("#student"));
assert.ok(!frStudentPlan?.description?.includes("CZK"));
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
assert.ok(ARTICLE_TIP_COPY.cs.nudgeLine.includes("Pomohl"));
assert.ok(ARTICLE_TIP_COPY.en.nudgeTip.includes("next reader"));
assert.ok(!ARTICLE_TIP_COPY.de.blurb.includes("Příspěvek"));
assert.ok(getHomepageLongevityCopy("cs").contributeHint.includes("dalšímu čtenáři"));
{
  const llms = renderLlmsTxt();
  assert.ok(llms.includes("ViaLongeVita"));
  assert.ok(llms.includes("How to cite"));
  assert.ok(llms.includes("/de"));
  assert.ok(llms.includes("/news-sitemap.xml"));
  assert.ok(!llms.includes("2 800+"));
}
{
  const ld = articleJsonLdGlobal({
    title: "Sleep",
    excerpt: "Rest",
    slug: "sleep",
    locale: "de",
    isAccessibleForFree: true,
  });
  assert.equal(ld.publisher.name, "ViaLongeVita");
  assert.ok(String(ld.url).includes("/de/article/"));
  assert.equal(ld.isAccessibleForFree, true);
}
assert.equal(publicEditorialByline("fr"), "Rédaction MedScopeGlobal");
assert.equal(publicEditorialByline("cs"), "Redakce MedScopeGlobal");
assert.ok(!publicEditorialByline("de").includes("Redakce"));
assert.equal(getArticleChrome("cs").save, "Uložit");
assert.equal(getArticleChrome("fr").save, "Enregistrer");
assert.equal(getArticleChrome("de").share, "Teilen");
assert.ok(!getArticleChrome("fr").related.includes("Související"));
assert.ok(!getArticleChrome("en").recsTitle.includes("dlouhověkost"));
assert.equal(getRevenueCopy("cs").newsletterCta.includes("brief") || getRevenueCopy("cs").newsletterCta.includes("Chci"), true);
assert.ok(!getRevenueCopy("de").partnerBody.includes("Kč"));
assert.ok(!getRevenueCopy("de").partnerPrice.includes("Kč"));
assert.ok(!getRevenueCopy("de").mediaKitLead.includes("1 300"));
assert.ok(!getRevenueCopy("cs").mediaKitLead.includes("1 300"));
assert.ok(!getRevenueCopy("de").bannerOfferDesc.includes("Kč"));
assert.ok(!getRevenueCopy("de").bannerOfferDesc.includes("články"));
assert.ok(!getRevenueCopy("de").priceListName.includes("Ceník"));
assert.ok(getRevenueCopy("cs").priceListName.includes("Ceník"));
assert.ok(!getB2BLandingCopy("de").formats.some((item) => /Kč|Sponzorovaný/.test(`${item.name} ${item.price}`)));
assert.ok(getB2BLandingCopy("de").formatsTitle === "Werbeformate");
assert.ok(getB2BLandingCopy("cs").formats.some((item) => item.price.includes("Kč")));
assert.equal(chromePack("it"), "it");
assert.equal(chromePack("es"), "es");
assert.equal(chromePack("pt-BR"), "pt-BR");
assert.equal(chromePack("en-UK"), "en");
assert.equal(chromePack("en-US"), "en");
assert.ok(!getRevenueCopy("it").sponsoredName.includes("Sponzorovaný"));
assert.ok(getRevenueCopy("it").sponsoredName.includes("Articolo"));
assert.ok(!getRevenueCopy("es").bannerOfferDesc.includes("Kč"));
assert.ok(!getRevenueCopy("pt-BR").priceListName.includes("Ceník"));
assert.ok(getRevenueCopy("pt-BR").priceListName.includes("Tabela"));
assert.equal(getB2BLandingCopy("it").formatsTitle, "Formati pubblicitari");
assert.equal(getB2BLandingCopy("es").formatsTitle, "Formatos publicitarios");
assert.ok(!getB2BLandingCopy("it").formats.some((item) => /Kč|Sponzorovaný/.test(`${item.name} ${item.price}`)));
assert.equal(getPortalChrome("it").readMagazine, "Apri la rivista");
assert.equal(getPortalChrome("es").readMagazine, "Abrir la revista");
assert.equal(getPortalChrome("pt-BR").readMagazine, "Abrir a revista");
assert.equal(getArticleChrome("it").share, "Condividi");
assert.equal(getArticleChrome("es").share, "Compartir");
assert.ok(!getSurfaceCopy("it").footer.apps.includes("Aplikace"));
assert.equal(getSurfaceCopy("it").footer.apps, "App");
assert.equal(getV27AudienceHubCopy("b2b", "it").label, "Per le aziende");
assert.equal(getV27AudienceHubCopy("b2b", "en-US").label, "For companies");
assert.ok(!getV27AudienceHubCopy("b2b", "es").label.includes("Pro firmy"));
assert.ok(!getHomepageLongevityCopy("it").title.includes("Tři"));
assert.ok(convertCzkToCharge(5000, "en-UK").currency === "gbp");
assert.ok(!b2bPricingForLocale("de").some((tier) => /Kč|CZK/.test(tier.priceLabel)));
assert.ok(b2bPricingForLocale("cs").some((tier) => tier.priceLabel.includes("Kč")));
assert.ok(getRevenueCopy("cs").partnerBody.includes("Kč"));
assert.ok(getRevenueCopy("cs").newsletterTitle.includes("ViaLongeVita"));
assert.ok(getRevenueCopy("fr").newsletterTitle.includes("ViaLongeVita"));
assert.ok(getRevenueCopy("de").newsletterTitle.includes("ViaLongeVita"));
assert.ok(getRevenueCopy("sk").newsletterBody.includes("týždenne") || getRevenueCopy("sk").newsletterBody.includes("slovensky"));
assert.ok(!looksLikeCzech(getRevenueCopy("fr").newsletterTitle));
assert.equal(getRevenueCopy("fr").newsletterCta.includes("brief") || getRevenueCopy("fr").newsletterCta.toLowerCase().includes("recevoir"), true);
assert.ok(!looksLikeCzech(getRevenueCopy("fr").partnerTitle));
assert.ok(!looksLikeCzech(getRevenueCopy("de").subscribeTitle));
assert.ok(getRevenueCopy("en").newsletterBody);
assert.ok(getRevenueCopy("ja").newsletterKicker === "ViaLongeVita");
assert.ok(!looksLikeCzech(getRevenueCopy("ja").newsletterBody));
assert.ok(!looksLikeCzech(getRevenueCopy("it").newsletterTitle));
assert.ok(getRevenueCopy("pl").newsletterBody.toLowerCase().includes("tygodniu") || getRevenueCopy("pl").newsletterCta.includes("brief"));
assert.equal(getRevenueCopy("sk").partnerCta, getRevenueCopy("en").partnerCta);

assert.equal(topicLabelForSlug("zivotni-styl", "cs"), "Životní styl");
assert.equal(topicLabelForSlug("zivotni-styl", "fr"), "Mode de vie");
assert.equal(topicLabelForSlug("zivotni-styl", "de"), "Lebensstil");
assert.equal(topicLabelForSlug("dlouhovekost", "en"), "Longevity");
assert.equal(topicLabelForSlug("dlouhovekost", "fr"), "Longévité");
assert.equal(topicLabelForSlug("dlouhovekost", "de"), "Langlebigkeit");
assert.equal(getVerejnostChrome("cs").dailyTipBadge, "Dnešní tip");
assert.equal(getVerejnostChrome("fr").dailyTipBadge, "Conseil du jour");
assert.equal(getVerejnostChrome("de").dailyTipBadge, "Tipp des Tages");
assert.ok(!looksLikeCzech(getVerejnostChrome("fr").dailyVideoEyebrow));
assert.ok(!looksLikeCzech(getVerejnostChrome("de").interviewBadge));
assert.equal(getVerejnostChrome("cs").interviewBadge, "Rozhovor");
assert.ok(!looksLikeCzech(getVerejnostNavStripCopy("fr").headline));
assert.ok(!looksLikeCzech(getVerejnostNavStripCopy("de").ctaLabel));
assert.equal(getVerejnostNavStripCopy("cs").ctaLabel, "Otevřít MeDipacient");
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
const csClankyHub = localizeMagazineHubConfig(getClankyMagazineHub(), "cs");
assert.equal(csClankyHub.editorialIntroTitle, "Vítejte v MedScopeGlobal");
assert.equal(csClankyHub.editorialIntro.length, 5);
assert.ok(csClankyHub.editorialIntro[0]?.includes("MedScopeGlobal"));
assert.ok(csClankyHub.editorialIntro.some((p) => p.includes("ViaLongeVita")));
assert.ok(!csClankyHub.editorialIntro.join(" ").includes("VIP"));
const frClankyHub = localizeMagazineHubConfig(getClankyMagazineHub(), "fr");
assert.equal(frClankyHub.editorialIntroTitle, "Bienvenue sur MedScopeGlobal");
assert.ok(!looksLikeCzech(frClankyHub.editorialIntro.join(" ")));
assert.ok(frClankyHub.editorialIntro.some((p) => p.includes("ViaLongeVita")));
const deClankyHub = localizeMagazineHubConfig(getClankyMagazineHub(), "de");
assert.equal(deClankyHub.editorialIntroTitle, "Willkommen bei MedScopeGlobal");
assert.ok(!looksLikeCzech(deClankyHub.editorialIntro.join(" ")));

assert.equal(localRegulatorShort("cs"), "SÚKL");
assert.equal(localRegulatorShort("en-US"), "FDA");
assert.equal(localRegulatorShort("en-UK"), "MHRA");
assert.equal(localRegulatorShort("it"), "AIFA");
assert.equal(localRegulatorShort("fr"), "ANSM");
assert.equal(getPortalChrome("en").services.find((s) => s.id === "leky")?.hint, "FDA");
assert.equal(getPortalChrome("it").services.find((s) => s.id === "leky")?.hint, "AIFA");
assert.equal(getPortalChrome("cs").services.find((s) => s.id === "leky")?.hint, "SÚKL");
assert.ok(!getPortalChrome("en").services.some((s) => s.hint === "SÚKL"));
assert.ok(!String(getSurfaceCopy("en-US").stats[0]?.label).includes("SÚKL"));
assert.ok(String(getSurfaceCopy("en-UK").stats[0]?.label).includes("MHRA"));
assert.ok(newsDesksForLocale("en-US").find((d) => d.id === "dlouhovekost")?.blurb.includes("US"));
assert.ok(newsDesksForLocale("en-UK").find((d) => d.id === "novinky")?.blurb.includes("NHS"));

const nativeUs = {
  id: "us-1",
  title: "Sleep and GLP-1: what US readers ask their PCP",
  slug: "sleep-glp1-us",
  excerpt: "FDA-labelled medicines and 911 — not Czech insurance.",
  locale: "en-US",
  public_topic: "dlouhovekost",
};
const czechOnly = {
  id: "cz-vzp",
  title: "Jak řešit úhradu u VZP a SÚKL v českém systému",
  slug: "vzp-sukl-uhrada",
  excerpt: "Pro české pacienty a přijímačky na 1. LF.",
  locale: "cs",
  public_topic: "prevence",
};
const czechLongevity = {
  id: "cz-sleep",
  title: "Zdravý spánek a healthspan",
  slug: "zdravy-spanek-healthspan",
  excerpt: "Longevity, sleep and biomarkers without local Czech paperwork.",
  locale: "cs",
  public_topic: "dlouhovekost",
};
assert.equal(isCzechOnlyInstitutional(czechOnly), true);
assert.equal(isShareableMagazineTopic(czechLongevity), true);
assert.equal(
  filterArticlesForLocale([nativeUs, czechOnly, czechLongevity], "en-US").some((a) => a.id === "us-1"),
  true
);
assert.equal(
  filterArticlesForLocale([nativeUs, czechOnly, czechLongevity], "en-US").some((a) => a.id === "cz-vzp"),
  false
);
assert.equal(
  filterArticlesForLocale([czechOnly], "cs").some((a) => a.id === "cz-vzp"),
  true
);
{
  const japanese = {
    id: "ja-1",
    title: "メンタルヘルス予防の新しい視点",
    slug: "mental-ja",
    excerpt: "longevity sleep GLP-1",
    locale: "ja",
    public_topic: "dlouhovekost",
  };
  assert.equal(
    filterArticlesForLocale([nativeUs, japanese], "en-US").some((article) => article.id === "ja-1"),
    false
  );
  assert.equal(filterArticlesForLocale([japanese], "en-US").length, 0);
}
const longSmoke = Array.from({ length: 820 }, () => "word").join(" ");
assert.equal(
  isListableNewsArticle(
    {
      ...nativeUs,
      slug: "verejnost-dlouhovekost-2026-09-01-sleep-glp1-us",
      content: longSmoke,
      published_at: "2026-09-01T10:00:00.000Z",
    } as never,
    new Date(),
    "en-US"
  ),
  true
);
assert.equal(
  isListableNewsArticle(
    {
      ...czechOnly,
      slug: "verejnost-prevence-2026-09-01-vzp-sukl",
      content: longSmoke,
      published_at: "2026-09-01T10:00:00.000Z",
    } as never,
    new Date(),
    "en-US"
  ),
  false
);
assert.equal(
  isListableNewsArticle(
    {
      ...czechOnly,
      slug: "verejnost-prevence-2026-09-01-vzp-sukl",
      content: longSmoke,
      published_at: "2026-09-01T10:00:00.000Z",
    } as never,
    new Date(),
    "cs"
  ),
  true
);
assert.ok(formatSyndicatedByline("en-US", "cs").includes("Czech desk"));
assert.ok(formatSyndicatedByline("it", "en-US").includes("USA"));
assert.ok(geopoliticalDeskBrief("en-US").includes("PCP"));
assert.ok(geopoliticalDeskBrief("en-US").includes("slim"));
assert.ok(!geopoliticalDeskBrief("en-US").includes("Piš česky pro české"));
assert.ok(buildNativeLocalePrompt("en-US").includes("American English"));
assert.ok(buildNativeLocalePrompt("en-US").includes("biohacking"));
assert.ok(!buildNativeLocalePrompt("fr").includes("Čeština s diakritikou"));

const usDesk = nativeDeskArticlesForLocale("en-US");
assert.ok(usDesk.length >= 4);
assert.ok(usDesk.every((article) => article.locale === "en-US"));
assert.ok(usDesk.some((article) => /GLP-1|PCP|911/.test(`${article.title} ${article.excerpt}`)));
assert.ok(!usDesk.some((article) => /VZP|SÚKL|přijímač/.test(`${article.title} ${article.excerpt}`)));
assert.ok(nativeDeskArticlesForLocale("fr").some((article) => /médecin traitant|ANSM/.test(`${article.title} ${article.excerpt}`)));
assert.ok(nativeDeskArticlesForLocale("it").some((article) => /medico di base|AIFA/.test(`${article.title} ${article.excerpt}`)));
assert.equal(nativeDeskArticlesForLocale("cs").length, 0);
assert.equal(mergeNativeDeskFeed([] as { locale?: string | null }[], "en-US")[0]?.locale, "en-US");
{
  const lead = usDesk[0];
  const second = usDesk[1];
  assert.ok(lead && second);
  const today = nativeDeskPinDate(0).toISOString().slice(0, 10);
  assert.equal(String(lead.published_at).slice(0, 10), today);
  assert.ok(String(second.published_at) < String(lead.published_at));
  const noon = nativeDeskPinDate(0);
  noon.setUTCHours(12, 0, 0, 0);
  const cronRow = { slug: "cron-fresh", locale: "en-US", published_at: noon.toISOString() };
  assert.equal(mergeNativeDeskFeed([cronRow], "en-US")[0]?.slug, "cron-fresh");
  const stale = { slug: "old-db", locale: "en-US", published_at: "2026-08-01T10:00:00.000Z" };
  assert.notEqual(mergeNativeDeskFeed([stale], "en-US")[0]?.slug, "old-db");
}
assert.equal(getV27AudienceHubCopy("physician", "it").label, "Per i medici");
assert.ok(!getV27AudienceHubCopy("public", "fr").label.includes("veřejnost"));
assert.ok(!getV27AudienceHubCopy("physician", "it").topics.some((topic) => /léčebné|ČLK|SÚKL/.test(topic)));
assert.ok(getV27AudienceHubCopy("physician", "it").topics.includes("ECM"));
const itPhysician = getPhysicianLandingCopy("it");
assert.equal(itPhysician.metaTitle, "Per i medici | MedScopeGlobal");
assert.ok(!/Pro lékaře|SÚKL|ČLK|Kč|českým/.test(JSON.stringify(itPhysician)));
assert.ok(itPhysician.sections.some((section) => section.label === "Area professionale"));
assert.ok(getPhysicianLandingCopy("cs").verifyAdminHref?.includes("clk-verifications"));
assert.equal(getPhysicianLandingCopy("en-US").verifyAdminHref, undefined);
{
  const itOrdi = getOrdiZaznamCopy("it");
  assert.equal(itOrdi.brand, "OrdiZapis");
  assert.ok(!/Kč|Ceník|Nahrajte|lékaři|zápis|zdarma/.test(JSON.stringify(itOrdi)));
  assert.ok(itOrdi.tryDemo.toLowerCase().includes("demo"));
  assert.equal(getOrdiZaznamCopy("cs").brand, "OrdiZáznam");
  assert.ok(!getOrdiZaznamCopy("fr").hero.includes("Nahrajte"));
  assert.ok(!getOrdiZaznamCopy("en-US").priceEyebrow.includes("Ceník"));
}
{
  const itDok = getDokumentaceCopy("it");
  assert.ok(!/českou ordinaci|Nahrajte|Pro lékaře|Kč|NIS/.test(JSON.stringify(itDok)));
  assert.ok(itDok.eyebrow.toLowerCase().includes("medic"));
  assert.ok(!getDokumentaceCopy("fr").stepsLead.includes("české"));
  assert.ok(getDokumentaceCopy("cs").valueProps.some((item) => item.text.includes("ordinaci")));
}
{
  const itPatient = getMedipacientCopy("it", { premium: "3,96 €" });
  assert.ok(!/Kč|Stáhnout|Nahrát|Zdarma|Předplatné|zprávy/.test(JSON.stringify(itPatient)));
  assert.equal(itPatient.showDemoReports, false);
  assert.ok(itPatient.premiumTitle.includes("3,96 €"));
  assert.ok(getMedipacientCopy("cs").showDemoReports);
  assert.ok(getMedipacientCopy("cs").downloadCta.includes("Stáhnout"));
  assert.ok(!getMedipacientCopy("fr").pitch.includes("Vyfoťte"));
}
{
  const itFlow = getMediflowCopy("it");
  assert.ok(!/Kč|Vyzkoušet|Spustit|deník|zdarma/.test(JSON.stringify(itFlow)));
  assert.ok(itFlow.startCta.toLowerCase().includes("mediflow"));
  assert.ok(getMediflowCopy("cs").tryCta.includes("Vyzkoušet"));
  assert.ok(!getMediflowCopy("de").lead.includes("Osobní"));
}
{
  const itInstall = getInstallPwaCopy("it", { name: "MeDipacient", path: "/app/pacient" });
  assert.ok(!/Stáhnout|Nainstalovat|Sdílet|ploše/.test(JSON.stringify(itInstall)));
  assert.ok(itInstall.downloadNamed.includes("MeDipacient"));
  assert.ok(getInstallPwaCopy("cs").download.includes("Stáhnout"));
  assert.ok(getMarketingCopy("fr").apps.pitch.mediflow.includes("Journal"));
  assert.ok(!getMarketingCopy("de").apps.pitch.medipacient.includes("Photograph"));
}
{
  const frB2b = getB2bPublicCopy("fr");
  assert.ok(!/Kč|Ceník|Sponzorovaný|měsíc|Kontaktovat/.test(JSON.stringify(frB2b)));
  assert.ok(frB2b.bannerMonth.toLowerCase().includes("bannière") || frB2b.bannerMonth.toLowerCase().includes("banniere"));
  assert.ok(getB2bPublicCopy("cs").sponsoredLabel.includes("Sponzorovaný"));
  assert.ok(!getDokumentaceCopy("fr").workspaceLead.includes("Nahrajte"));
  assert.ok(!getDokumentaceCopy("fr").workspaceLead.includes("édition tchèque"));
  assert.ok(getDokumentaceCopy("cs").workspaceCta.includes("OrdiZapis"));
  assert.equal(dokumentaceNoteLanguage("fr").whisper, "fr");
  assert.equal(dokumentaceNoteLanguage("cs").whisper, "cs");
  assert.ok(structureSystemPrompt("fr").includes("French") || structureSystemPrompt("fr").includes("français"));
  assert.ok(!structureSystemPrompt("fr").includes("češtinou"));
  assert.ok(structureSystemPrompt("cs").includes("češtinou"));
  assert.ok(sttPromptFor("fr").includes("français"));
  assert.ok(!sttPromptFor("fr").includes("češtině"));
  assert.equal(getOrdiZapisAppCopy("fr").dictate, "Dicter");
  assert.equal(getOrdiZapisAppCopy("cs").tabNote, "Zápis");
  assert.ok(!getOrdiZapisAppCopy("fr").upload.includes("Nahrát"));
  assert.ok(!getOrdiZapisAppCopy("fr").installGated.includes("Stažení"));
  assert.equal(getOrdiZapisAppCopy("fr").accessLabel, "Accès");
  assert.ok(!getOrdiZapisAppCopy("it").errConsent.includes("souhlas"));
  assert.equal(getOrdiZapisAppCopy("fr").installTipTitle, "Ajouter à l’écran d’accueil");
  assert.ok(!getOrdiZapisAppCopy("de").progressPrepareUpload.includes("Připravuji"));
  assert.ok(!getDokumentaceCopy("fr").trialLine.includes("zdarma"));
  assert.ok(!getDokumentaceCopy("en").facilitiesLabel.includes("Zařízení"));
  assert.ok(getOrdiZapisApiCopy("fr").unauthMessage.toLowerCase().includes("connectez"));
  assert.ok(!getOrdiZapisApiCopy("es").quotaDemo.includes("Vyčerpán"));
  assert.equal(isCzechFacultyLocale("fr"), false);
  assert.equal(isCzechFacultyLocale("cs"), true);
  assert.ok(!getCzechFacultyOnlyCopy("de").lead.includes("přijímačky"));
  assert.ok(getCzechFacultyOnlyCopy("it").openCs.toLowerCase().includes("ceca") || getCzechFacultyOnlyCopy("it").openCs.toLowerCase().includes("edizione"));
  assert.ok(!getCzechFacultyOnlyCopy("fr", "academy").lead.includes("přijímačky"));
  assert.ok(!getCzechFacultyOnlyCopy("fr", "academy").title.includes("Vzdělávání"));
  assert.ok(getCzechFacultyOnlyCopy("fr", "academy").title.toLowerCase().includes("tchèque") || getCzechFacultyOnlyCopy("fr", "academy").lead.includes("édition tchèque"));
  assert.ok(!getCzechFacultyOnlyCopy("de", "students").title.includes("Studenti"));
  assert.equal(czechFacultyProductForPath("/academy/lekari"), "academy");
  assert.equal(czechFacultyProductForPath("/studenti/materialy"), "students");
  assert.equal(czechFacultyProductForPath("/studenti"), null);
  assert.equal(czechFacultyProductForPath("/studenti/darkove"), null);
  assert.equal(czechFacultyProductForPath("/lekari/dokumentace"), null);
}
const itLekari = getPhysicianHubExtrasCopy("it");
assert.ok(!/ČLK|Kč|Pro lékaře|Důvěryhodnost/.test(JSON.stringify(itLekari)));
assert.equal(itLekari.tierName, "Medico in pratica");
assert.ok(newsDesksForLocale("en-US").find((d) => d.id === "novinky")?.label === "News");
assert.ok(!newsDesksForLocale("it").some((d) => d.label === "Aktuality"));
const usRelated = relatedNativeDeskArticles("en-US", { slug: usDesk[0]!.slug }, 3);
assert.ok(usRelated.length >= 2);
assert.ok(usRelated.every((article) => article.locale === "en-US"));
assert.ok(!usRelated.some((article) => article.slug === usDesk[0]!.slug));
assert.ok(usRelated.every((article) => article.deskOrigin === "native"));
assert.ok(!getV27AudienceGridCopy("it").title.includes("Tři"));
assert.ok(getHomepageLongevityCopy("en-US").steps.some((step) => /slim|weight|GLP/i.test(`${step.title} ${step.desc}`)));
assert.ok(!getSurfaceCopy("it").why[0]?.title.includes("Magazine + apps on one platform"));

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
