#!/usr/bin/env node
/**
 * Local functional checks for MeDipacient, MeDiprep, and the app catalog.
 * Run via: pnpm exec tsx scripts/apps/functional-check.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { APP_PRODUCTS, MEDIFLOW, ORDIZAPIS_APP, MEDIPACIENT, MEDIPREP } from "../../lib/apps/catalog";
import { publicDemoDashboard } from "../../lib/medipacient/demo-dashboard";
import { MEDIPACIENT_DEMO_REPORTS } from "../../lib/medipacient/demo-reports";
import { parseReportText, documentFromUpload } from "../../lib/medipacient/parse-report";
import { buildPrepTest, getPrepDashboard } from "../../lib/mediprep/dashboard";
import { bankStats } from "../../lib/prijimacky/question-bank";
import { generateSelfTest } from "../../lib/prijimacky/quiz-from-bank";
import { FACULTIES_ADMISSIONS_2026 } from "../../lib/prijimacky/faculties-admissions";
import {
  getAffiliateRedirectDestination,
  applyAmazonAssociateTag,
  AD_INVENTORY,
  getClientAdConfig,
} from "../../lib/ecosystem/monetization";
import {
  classifyRevenueSurface,
  matchAffiliateProductIds,
  shouldShowAffiliate,
  shouldShowDisplayAds,
  shouldShowOrdiZapisCta,
  shouldShowPublicSubscribeNudge,
  LONGEVITY_MEDIA_KIT,
} from "../../lib/monetization/revenue-mix";
import {
  ADSENSE_ADS_TXT,
  ADSENSE_PUBLISHER_ID,
  ADSENSE_SLOT_IN_ARTICLE,
  adsAllowedOnPath,
  isAdSenseEnabled,
  resolveAdSenseClientId,
  resolveAdSenseSlotId,
} from "../../lib/monetization/adsense";
import {
  GA_MEASUREMENT_ID,
  isGoogleAnalyticsEnabled,
  resolveGaMeasurementId,
} from "../../lib/analytics/ga";
import { NEWSLETTER_SUBSCRIBERS_SQL } from "../../lib/monetization/apply-schema";
import {
  affiliateGoPath,
  applyHeurekaTracking,
  fallbackUntrackedHeurekaToAmazonDe,
  AFFILIATE_PRODUCT_IDS,
} from "../../lib/monetization/affiliate-geo";
import {
  affiliateHopCopy,
  hopHtmlHidesTracking,
  renderAffiliateHopHtml,
} from "../../lib/monetization/affiliate-hop";
import { pickAffiliateProducts, AFFILIATE_SLOT_COUNTS } from "../../lib/monetization/affiliate-mix";
import { composeBriefLead, composeBriefSubject } from "../../lib/monetization/brief-marketing";
import { newsletterHeadline } from "../../lib/v23/newsletter/title";
import { splitHtmlAfterParagraphs } from "../../lib/monetization/split-article-html";
import { getPayoutReadiness, PAYOUT_CHANNELS } from "../../lib/monetization/payout-map";
import {
  ADMIN_NAV_GROUPS,
  ADMIN_NAV_ITEMS,
} from "../../components/admin/admin-nav-config";
import { isAdminNavActive } from "../../lib/admin/nav-active";
import { aggregateAffiliateClicks } from "../../lib/admin/click-stats";
import {
  DESK_SLUGS,
  EDITORIAL_TAXONOMY,
  SPECIALTY_SLUGS,
  classifyCategoryRow,
  missingEditorialSlugs,
  slugifyCategory,
} from "../../lib/admin/taxonomy";
import { editorialRowsToInsert } from "../../lib/admin/ensure-taxonomy";
import { formatStripeMinor } from "../../lib/admin/stripe-snapshot";
import {
  ADMIN_GATE_COOKIE,
  ADMIN_GATE_COOKIE_LEGACY,
  getAdminGatePassword,
  hasValidAdminGateCookie,
  isAdminLoginPath,
  isValidAdminGateCookie,
  requiresAdminGate,
} from "../../lib/auth/admin-gate-config";
import { shouldBlockBot } from "../../lib/v30/security/bot-shield";
import { V20_NZIP_CATEGORIES } from "../../lib/v20/categories";
import { getRevenueCopy } from "../../lib/i18n/revenue-copy";
import { getSurfaceCopy } from "../../lib/i18n/surface-copy";
import { getOrdiZapisAppCopy } from "../../lib/i18n/ordizapis-app-copy";
import { getOrdiZapisApiCopy } from "../../lib/i18n/ordizapis-api-copy";
import { getDokumentaceCopy } from "../../lib/i18n/dokumentace-copy";
import {
  parseHeurekaPositionId,
  heurekaHopHtml,
  heurekaMarketFromUrl,
  applyHeurekaHaff,
  publicMarketplaceUrl,
  marketplaceUrlShowsTracking,
  DEFAULT_HEUREKA_CZ_HAFF,
  DEFAULT_HEUREKA_CZ_TRIXAM,
  HEUREKA_CZ_TEXT_LINK,
  HEUREKA_HOP_CSP,
} from "../../lib/monetization/heureka-affiliate";
import { shouldShowHeurekaTextLink } from "../../components/monetization/heureka-text-link";
import {
  inferArticleTopic,
  inferVisualTopic,
  matchImageForArticleSync,
  validateImageCompliance,
  isMissingOrStaleHeroImage,
  scanTextForBlockedTopics,
  getArticleHeroAltText,
  resolveArticleCoverUrl,
  classifyCoverTopic,
  assignUniqueListingCovers,
  coverIdentity,
  coverVisualFamily,
  isFoodCoverUrl,
  isClinicalOrBrainCoverUrl,
  isDeniedEditorialImageUrl,
  isBrainScanCoverUrl,
  articleNeedsCoverRemediation,
} from "../../lib/ecosystem/editorial/images";
import {
  EDITORIAL_PERSONAS,
  getImageCuratorForLocale,
  getReviewPipeline,
} from "../../lib/ecosystem/editorial/personas";
import {
  WRITER_AGENTS,
  WRITER_DESKS,
  WRITER_SPECIALISTS,
  WRITERS_PER_CATEGORY,
  resolveWriterAgent,
} from "../../lib/editorial/writer-agents";
import {
  DAILY_PUBLIC_ARTICLE_TARGET,
  DEFAULT_PUBLIC_WRITER_LIMIT,
  PUBLIC_WRITER_COUNT,
  PUBLIC_WRITERS_PER_CATEGORY,
  publicWriterSliceForHour,
} from "../../lib/v25/config/public-writers";
import { reviewPublicArticle } from "../../lib/v25/writers/editorial-review.mjs";
import { polishCzechFields } from "../../lib/v22/translate";
import {
  classifyNewsDesk,
  isListableNewsArticle,
  isLongevityArticle,
  isProfessionalAktualityTitle,
  mergeAktualityListing,
  isHomepageDeskArticle,
  pinHomepageDesks,
  prependUniqueArticles,
  splitNewsDesks,
  uniqueHomepageLayout,
  mixListableFeed,
} from "../../lib/v271/news-desks";
import {
  canStartClubRun,
  normalizeStudentNick,
  rankClubScores,
  remainingFreeRuns,
  STUDENT_CLUB_FREE_RUNS,
} from "../../lib/studenti/club";
import { studentClubOpenFromProfile } from "../../lib/billing/student-entitlement";
import { isPhysicianGrantProduct, isStudentGrantProduct } from "../../lib/v27/config";
import { studentIntroCharge, studentMonthlyCharge, STUDENT_FREE_TESTS, isStudentChromePath } from "../../lib/studenti/pricing";
import { studentPublicHref } from "../../lib/studenti/href";
import { facultiesForLocale, facultyCountryForLocale } from "../../lib/prijimacky/faculties-by-country";
import {
  articleDisplayDate,
  articlePageKey,
  articleWasRefreshed,
  rollEvergreenListingDate,
} from "../../lib/editorial/freshness";
import {
  isLongevityForeignSource,
  rankV26ForeignSources,
} from "../../lib/v26/foreign-news-ingest";
import { hubTopicListingHref } from "../../lib/config/verejnost-topics";
import { formatEditorialUnitDisplay, formatSyndicatedByline, publicEditorialByline } from "../../lib/editorial/units";
import { filterArticlesForLocale } from "../../lib/i18n/filter-articles-for-locale";
import {
  applyMagazineDeskCopy,
  polishMagazineExcerpt,
  polishMagazineTitle,
} from "../../lib/editorial/magazine-desk-copy";
import { MAGAZINE_DESK_OVERRIDES } from "../../lib/editorial/magazine-desk-overrides";
import {
  anonymizeClinicianNames,
  publicArticleSlug,
  resolveCanonicalArticleSlug,
} from "../../lib/editorial/clinician-anonymize";
import {
  EDITORIAL_DESKS,
  PRIMARY_EDITORIAL_LOCALES,
  getDeskForLocale,
  getPrimaryDesks,
  createEditorialQueueItem,
} from "../../lib/ecosystem/editorial";
import { GLOBAL_LOCALES, localeFromCountry } from "../../lib/ecosystem/locales";
import {
  MAGAZINE_EDITORS_PER_LOCALE,
  MAGAZINE_WRITERS_PER_LOCALE,
  allLocaleMagazineDesks,
  totalDeployedMagazineEditors,
  totalDeployedMagazineWriters,
} from "../../lib/editorial/locale-magazine-desks";
import { buildDeskComment, foreignDeskMayComment } from "../../lib/editorial/desk-comments";
import { getHomepageLongevityCopy } from "../../lib/i18n/homepage-longevity";
import { getNewsletterCopy } from "../../lib/i18n/newsletter-copy";
import { translateNavHref } from "../../lib/i18n/nav-copy";
import {
  FOREIGN_WRITER_ROTATION,
  defaultPublicWriterLocales,
  describeDailyWriterPlan,
  rotatingForeignWriterLocale,
} from "../../lib/v25/config/public-writers";
import { looksLikeCzech } from "../../lib/i18n/czech-detect";
import {
  NEWSLETTER_PRIMARY_LOCALES,
  newsletterIssueSlug,
  parseNewsletterIssueSlug,
  publicNewsletterSlugCandidates,
} from "../../lib/v23/newsletter/locale-editions";
import { magazineCategoriesForLocale } from "../../lib/editorial/magazine-category-copy";
import { buildLocaleMagazineLayout } from "../../lib/v23/newsletter/locale-layout";
import type { LocaleMagazineSources } from "../../lib/v23/newsletter/locale-layout";
import { SYNDICATION_RULES, getSyndicationTargets } from "../../lib/ecosystem/editorial/syndication";
import { APP_MARKETING_IMAGE, MARKETING_VISUALS } from "../../lib/brand/marketing-visuals";
import { getMagazineCopy } from "../../lib/brand/magazine";
import {
  MAGAZINE_LISTING_MIN_WORDS,
  shouldHideFromPublicListing,
  filterMagazineListableArticles,
} from "../../lib/editorial/article-quality-audit";
import { getDemoMagazineArticles } from "../../lib/verejnost/demo-magazine-articles";
const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function file(rel: string) {
  assert.ok(existsSync(join(root, rel)), `missing ${rel}`);
}

function absent(rel: string, reason: string) {
  assert.ok(!existsSync(join(root, rel)), reason);
}

assert.equal(APP_PRODUCTS.length, 4, "four consumer apps");
assert.equal(MEDIPACIENT.appPath, "/app/pacient");
assert.equal(MEDIPREP.appPath, "/app/priprava");
assert.equal(MEDIFLOW.appPath, "/app/mediflow");
assert.equal(MEDIFLOW.downloadPath, "/mediflow/stahnout");
assert.equal(ORDIZAPIS_APP.shortName, "OrdiZapis");
assert.equal(ORDIZAPIS_APP.id, "ordizapis");
assert.equal(ORDIZAPIS_APP.appPath, "/app/dokumentace");
assert.equal(MEDIPACIENT.manifest, "/medipacient-manifest.json");
assert.equal(MEDIPREP.manifest, "/mediprep-manifest.json");
assert.equal(MEDIFLOW.manifest, "/mediflow-manifest.json");
assert.equal(ORDIZAPIS_APP.manifest, "/dokumentace-manifest.json");
assert.equal(MEDIPACIENT.domain, "medscopeglobal.com");

for (const app of APP_PRODUCTS) {
  file(`public${app.manifest}`);
  file(`public${app.serviceWorker}`);
  file(`public${app.assets.icon192}`);
  file(`public${app.assets.icon512}`);
  file(`public${app.assets.appleTouch}`);
}

assert.equal(MEDIPACIENT_DEMO_REPORTS.length, 5, "five trial reports");
const dash = publicDemoDashboard();
assert.equal(dash.documents.length, 5);
assert.ok(dash.stats.reports >= 5);
assert.ok(dash.stats.diagnoses >= 3);
assert.ok(dash.stats.meds >= 3);
assert.ok(dash.timeline.length >= 5);
assert.ok(dash.labValues.length >= 3);
assert.ok(dash.questions.length >= 4);
assert.ok(dash.nextVisit.label.length > 4);
assert.ok(dash.diagnoses.some((d) => /hypertenz/i.test(d)));
assert.ok(dash.medications.some((m) => /metformin/i.test(m.name)));

const parsed = parseReportText(
  `AMBULANTNÍ ZPRÁVA
Dg.: I10 Esenciální hypertenze
E11.9 Diabetes mellitus 2. typu
Terapie: Metformin 1000 mg 1-0-1
HbA1c 7,4 %
LDL 3,1
TK 148/92 mmHg
Kontrola 28. 5. 2026.
Poučení: sůl do 5 g/den, chůze 150 min.`,
  "zkouska.pdf"
);
assert.ok(parsed.diagnosy.some((d) => /I10|hypertenz/i.test(d)));
assert.ok(parsed.leky.some((m) => /metformin/i.test(m.name)));
assert.equal(parsed.termin_kontroly.vypoctene_datum, "2026-05-28");
assert.ok(parsed.labValues.some((l) => l.name === "HbA1c" && l.flag === "high"));

const uploaded = documentFromUpload({
  id: "u1",
  filename: "zprava.pdf",
  text: "Diabetes mellitus 2. typu. Metformin 1000 mg 1-0-1. Kontrola 1. 6. 2026.",
});
assert.equal(uploaded.kind, "upload");
assert.equal(uploaded.demo, false);

const stats = bankStats();
assert.equal(stats.total, 72, "question bank size");
assert.equal(stats.bySubject.biologie, 24);
assert.equal(stats.bySubject.chemie, 24);
assert.equal(stats.bySubject.fyzika, 24);

const quiz = generateSelfTest({
  subjects: ["biologie", "chemie", "fyzika"],
  count: 12,
  seed: "functional-check",
});
assert.equal(quiz.questions.length, 12);
assert.ok(quiz.questions.every((q) => q.options.length >= 2));
assert.ok(quiz.questions.every((q) => q.correct_answer.index >= 0 && q.correct_answer.index < q.options.length));

const prep = getPrepDashboard();
assert.equal(prep.faculties.length, FACULTIES_ADMISSIONS_2026.length);
assert.ok(prep.faculties.length >= 8);
assert.equal(prep.bank.total, 72);
assert.equal(prep.weeklyPlan.length, 7);
assert.ok(prep.weakTopics.length >= 3);
assert.equal(prep.demoScore.total, 12);

const test = buildPrepTest({ mode: "simulace", count: 12, faculty: "lf-uk-1", seed: "sim-1" });
assert.equal(test.questions.length, 12);
const again = buildPrepTest({ mode: "simulace", count: 12, faculty: "lf-uk-1", seed: "sim-1" });
assert.deepEqual(
  again.questions.map((q) => q.id),
  test.questions.map((q) => q.id),
  "same seed yields same test"
);

file("app/(public)/aplikace/page.tsx");
file("app/(pacient-app)/app/pacient/page.tsx");
file("app/(prep-app)/app/priprava/page.tsx");
file("app/(mediflow-app)/app/mediflow/page.tsx");
file("app/(public)/mediflow/stahnout/page.tsx");
file("app/api/medipacient/timeline/route.ts");
file("app/api/mediflow/dashboard/route.ts");
file("app/api/mediprep/dashboard/route.ts");
file("app/api/mediprep/test/route.ts");
file("app/api/apps/qr/route.ts");

file("app/(public)/go/[slug]/route.ts");
file("lib/monetization/affiliate-hop.ts");
file("lib/articles/prepare-for-display.ts");
file("lib/v22/homepage-cache.ts");
{
  const prep = readFileSync(join(root, "lib/articles/prepare-for-display.ts"), "utf8");
  const passthrough = prep.split('item.kind === "passthrough"')[1] ?? "";
  const passthroughBlock = passthrough.split("const cached")[0] ?? "";
  assert.ok(
    !passthroughBlock.includes("fallbackTranslateFields"),
    "passthrough cards must not call live MT (that made /de /en /fr take ~50s)"
  );
  assert.ok(
    prep.includes('plan[index]?.kind === "translate"'),
    "live MT fill is only for the translate cap, not every Czech leftover"
  );
  const home = readFileSync(join(root, "lib/v22/homepage-cache.ts"), "utf8");
  assert.ok(home.includes("filterArticlesForLocale"), "homepage listings are native-first per locale");
  assert.ok(home.includes("mergeNativeDeskFeed"), "homepage pins native desk pieces");
  assert.ok(
    !readFileSync(join(root, "app/(public)/page.tsx"), "utf8").includes(
      "getArticlesByMetadataSection"
    ) &&
    readFileSync(join(root, "app/(public)/page.tsx"), "utf8").includes("uniqueHomepageLayout") &&
    readFileSync(join(root, "lib/v22/homepage-cache.ts"), "utf8").includes(
      "homepage-timeout"
    ) &&
      readFileSync(join(root, "lib/v271/news-desks.ts"), "utf8").includes("articlePageKey"),
    "homepage must assign each story to one slot"
  );
  assert.ok(home.includes("v23-36-single-pool"), "homepage cache key must bust when the listing pool slims");
  assert.ok(home.includes("toISOString().slice(0, 10)"), "homepage data cache must roll with the UTC day");
  assert.ok(home.includes("slice(0, 48)"), "non-CS homepage prepares a short feed");
  assert.ok(home.includes("courtesyBorrow: 2"), "non-CS homepage must not dump a Czech borrow pile");
}
{
  const hop = readFileSync(join(root, "app/relay/[...path]/route.ts"), "utf8");
  const nextCfg = readFileSync(join(root, "next.config.mjs"), "utf8");
  assert.ok(
    hop.includes('no-store') && nextCfg.includes('source: "/relay/:path*"'),
    "GA collect hop must not inherit the public page s-maxage"
  );
}
{
  const box = readFileSync(join(root, "components/monetization/affiliate-box.tsx"), "utf8");
  assert.ok(
    box.includes("carryLocale: true"),
    "public cards must pass locale so /de /fr /en open the right store"
  );
}
file("scripts/cloudflare/assert-live-host.mjs");
{
  const liveHost = readFileSync(join(root, "scripts/cloudflare/assert-live-host.mjs"), "utf8");
  assert.ok(liveHost.includes("/robots.txt"), "live host assert must probe /robots.txt");
  assert.ok(
    liveHost.includes("user-agent"),
    "live host assert must send a UA so bot shield does not stall Node fetch"
  );
  assert.ok(
    !liveHost.includes('"/cs"') && !liveHost.includes("'/cs'"),
    "live host assert must not HEAD the Czech homepage — SSR hangs CI"
  );
  assert.ok(
    !liveHost.includes("/go/vitamin-d3-k2"),
    "live host assert must not wait on affiliate hops that stall after deploy"
  );
}
file("scripts/cloudflare/deploy.mjs");
absent("vercel.json", "vercel.json must not exist — production is Cloudflare Workers");
absent("vercel.json.bak", "vercel.json.bak must not exist");
absent(
  ".github/workflows/vercel-auto-deploy.yml",
  "Vercel GitHub workflows must be removed"
);
absent(".github/workflows/deploy-v17.yml", "V17 Vercel workflow must be removed");
absent(".github/workflows/deploy-v18.yml", "V18 Vercel workflow must be removed");
file(".github/workflows/cloudflare-deploy.yml");
{
  const v18 = readFileSync(join(root, "scripts/verify-v18.mjs"), "utf8");
  assert.ok(v18.includes("cloudflare-deploy.yml"), "v18 verify must require Cloudflare deploy workflow");
  assert.ok(!v18.includes("deploy-v18.yml"), "v18 verify must not require the deleted Vercel workflow");
}
absent("scripts/run-vercel-build.mjs", "Next.js build must not go through a Vercel wrapper");
{
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  assert.ok(!pkg.scripts?.["vercel:env"], "package.json must not expose vercel:env");
  assert.ok(
    !JSON.stringify(pkg.scripts ?? {}).includes("vercel"),
    "package.json scripts must not invoke Vercel"
  );
  assert.equal(pkg.scripts?.["build:next"], "node scripts/run-cloudflare-build.mjs");
  assert.ok(pkg.scripts?.["cf:deploy"]?.includes("cloudflare"));
}
file("public/assets/affiliate/magnesium.svg");
file("public/assets/affiliate/omega-test.svg");
file("public/assets/affiliate/sleep-tracker.svg");

assert.equal(getAffiliateRedirectDestination("mg-cz")?.includes("heureka.cz"), true);
assert.equal(getAffiliateRedirectDestination("mg-us")?.includes("amazon.com"), true);
assert.equal(getAffiliateRedirectDestination("unknown"), null);
assert.ok(getAffiliateRedirectDestination("magnesium-glycinate", { locale: "fr" })?.includes("amazon.fr"));
assert.ok(getAffiliateRedirectDestination("magnesium-glycinate", { locale: "de" })?.includes("amazon.de"));
assert.ok(getAffiliateRedirectDestination("magnesium-glycinate", { locale: "cs" })?.includes("heureka.cz"));
assert.equal(affiliateGoPath("vitamin-d3-k2", "cs"), "/go/vitamin-d3-k2");
assert.equal(affiliateGoPath("vitamin-d3-k2", "cs", { carryLocale: true }), "/go/vitamin-d3-k2?locale=cs");
assert.equal(affiliateHopCopy("cs").cta, "Porovnat ceny");
{
  const dest = "https://www.heureka.cz/?h%5Bfraze%5D=vitamin+d3+k2&haff=282255&utm_medium=affiliate";
  const hop = renderAffiliateHopHtml({
    destination: dest,
    heurekaTrixamId: "282255",
    locale: "cs",
    productName: "Vitamin D3 + K2",
    imageUrl: "/assets/affiliate/d3.svg",
  });
  assert.ok(hop.includes("Otevíráme srovnání cen"));
  assert.ok(hop.includes("ViaLongeVita"));
  assert.ok(hop.includes("Vitamin D3 + K2"));
  assert.ok(hop.includes("heureka-affiliate-link"));
  assert.ok(hop.includes('data-trixam-positionid="282255"'));
  assert.ok(!hop.includes("haff="), "hop must not expose Přímý odkaz query");
  assert.ok(!hop.includes("utm_medium=affiliate"));
  assert.ok(hopHtmlHidesTracking(hop));
  const sunrise = renderAffiliateHopHtml({
    destination:
      "https://www.heureka.cz/?h%5Bfraze%5D=sv%C4%9Bteln%C3%BD+bud%C3%ADk&haff=282255&utm_medium=affiliate",
    heurekaTrixamId: "282255",
    locale: "cs",
    productName: "Světelný budík",
  });
  assert.ok(hopHtmlHidesTracking(sunrise));
  assert.ok(!sunrise.includes("haff="));
  const amazonHop = renderAffiliateHopHtml({
    destination: "https://www.amazon.de/s?k=x&tag=vialongevita-21",
    leavePath: "/go/sunrise-alarm?leave=1",
    locale: "de",
    productName: "Sunrise alarm",
  });
  assert.ok(amazonHop.includes("/go/sunrise-alarm?leave=1"));
  assert.ok(!amazonHop.includes("amazon.de"));
  assert.ok(!amazonHop.includes("tag="));
  assert.ok(hopHtmlHidesTracking(amazonHop));
  const preview = renderAffiliateHopHtml({
    destination: dest,
    heurekaTrixamId: "282255",
    locale: "cs",
    productName: "Vitamin D3 + K2",
    autoLeaveMs: 0,
  });
  assert.ok(!preview.includes("setTimeout(go"));
}
assert.ok(
  !getRevenueCopy("cs").affiliateDisclosure.toLowerCase().includes("affiliate (heureka"),
  "public disclosure must not name the affiliate networks first"
);
assert.ok(
  getRevenueCopy("en").affiliateDisclosure.includes("As an Amazon Associate I earn from qualifying purchases.")
);
assert.ok(getAffiliateRedirectDestination("magnesium-glycinate", { locale: "sk" })?.includes("heureka.sk"));
{
  const czLive = getAffiliateRedirectDestination("magnesium-glycinate", { locale: "cs" })!;
  assert.ok(czLive.includes("heureka.cz"), "CZ must open Heureka with Přímý odkaz");
  assert.ok(czLive.includes("haff=282255"), "CZ Heureka must carry webmaster haff");
  assert.ok(czLive.includes("utm_medium=affiliate"));
  assert.equal(
    fallbackUntrackedHeurekaToAmazonDe(czLive, "cs").includes("heureka.cz"),
    true,
    "tagged haff must not fall back to Amazon"
  );
  const untagged = fallbackUntrackedHeurekaToAmazonDe("https://www.heureka.cz/?h%5Bfraze%5D=x", "cs");
  assert.ok(untagged.includes("amazon.de"), "untagged Heureka still falls back to Amazon.de");
  assert.ok(untagged.includes("language=cs"), "Amazon.de must use the Czech UI for CZ readers");
  assert.ok(getAffiliateRedirectDestination("creatine-monohydrate", { locale: "de" })?.includes("amazon.de"));
  assert.ok(getAffiliateRedirectDestination("protein-powder", { locale: "fr" })?.includes("amazon.fr"));
  assert.ok(getAffiliateRedirectDestination("yoga-mat", { locale: "it" })?.includes("amazon.it"));
  assert.equal(AFFILIATE_PRODUCT_IDS.length, 24);
}
assert.ok(getAffiliateRedirectDestination("magnesium-glycinate", { locale: "it" })?.includes("amazon.it"));
assert.ok(getAffiliateRedirectDestination("magnesium-glycinate", { locale: "es" })?.includes("amazon.es"));
assert.ok(getAffiliateRedirectDestination("magnesium-glycinate", { locale: "ja" })?.includes("amazon.co.jp"));
assert.ok(getAffiliateRedirectDestination("magnesium-glycinate", { locale: "en", region: "USA" })?.includes("amazon.com"));
assert.ok(getAffiliateRedirectDestination("magnesium-glycinate", { locale: "en", region: "UK" })?.includes("amazon.co.uk"));
assert.equal(
  Boolean(getAffiliateRedirectDestination("magnesium-glycinate", { locale: "fr" })?.includes("heureka")),
  false
);
assert.ok(
  applyAmazonAssociateTag("https://www.amazon.com/s?k=x", "tag-20").includes("tag=tag-20")
);
assert.ok(
  applyAmazonAssociateTag("https://www.amazon.co.jp/s?k=x", "jp-20").includes("tag=jp-20")
);
assert.equal(
  applyAmazonAssociateTag("https://www.heureka.cz/?h=x", "tag-20").includes("tag="),
  false
);
{
  const prev = process.env.AFFILIATE_HEUREKA_CZ_TEMPLATE;
  process.env.AFFILIATE_HEUREKA_CZ_TEMPLATE = "https://track.example/go?u={url}";
  const wrapped = getAffiliateRedirectDestination("mg-cz");
  assert.ok(wrapped?.includes("track.example"), "Heureka template must wrap CZ hops");
  assert.ok(
    applyHeurekaTracking("https://www.heureka.cz/?h%5Bfraze%5D=x")?.includes("track.example")
  );
  if (prev === undefined) delete process.env.AFFILIATE_HEUREKA_CZ_TEMPLATE;
  else process.env.AFFILIATE_HEUREKA_CZ_TEMPLATE = prev;
}
assert.ok(PAYOUT_CHANNELS.some((channel) => channel.id === "amazon"));
assert.ok(PAYOUT_CHANNELS.some((channel) => channel.id === "heureka-cz"));
assert.equal(getPayoutReadiness().amazonAny, false);
assert.equal(getPayoutReadiness().heurekaCz, true);
assert.equal(getPayoutReadiness().ga, true);
{
  const tagged = applyAmazonAssociateTag(
    "https://www.amazon.com/s?k=magnesium+glycinate",
    "vialongevita-20"
  );
  assert.ok(tagged.includes("tag=vialongevita-20"), "US Store ID must attach to amazon.com");
  const prevFallback = process.env.AFFILIATE_AMAZON_TAG;
  const prevDe = process.env.AFFILIATE_AMAZON_TAG_DE;
  process.env.AFFILIATE_AMAZON_TAG = "vialongevita-20";
  process.env.AFFILIATE_AMAZON_TAG_DE = "vialongevita-21";
  const prevEs = process.env.AFFILIATE_AMAZON_TAG_ES;
  const prevFr = process.env.AFFILIATE_AMAZON_TAG_FR;
  const prevUk = process.env.AFFILIATE_AMAZON_TAG_UK;
  const prevIt = process.env.AFFILIATE_AMAZON_TAG_IT;
  process.env.AFFILIATE_AMAZON_TAG_ES = "vialongevit04-21";
  process.env.AFFILIATE_AMAZON_TAG_FR = "vialongevit0b-21";
  process.env.AFFILIATE_AMAZON_TAG_UK = "vialongevi074-21";
  process.env.AFFILIATE_AMAZON_TAG_IT = "vialongevi07b-21";
  const de = applyAmazonAssociateTag("https://www.amazon.de/s?k=Magnesiumglycinat");
  const us = applyAmazonAssociateTag("https://www.amazon.com/s?k=magnesium+glycinate");
  const fr = applyAmazonAssociateTag("https://www.amazon.fr/s?k=x");
  const es = applyAmazonAssociateTag("https://www.amazon.es/s?k=x");
  const uk = applyAmazonAssociateTag("https://www.amazon.co.uk/s?k=x");
  const it = applyAmazonAssociateTag("https://www.amazon.it/s?k=x");
  assert.ok(de.includes("tag=vialongevita-21"), "DE PartnerNet ID must win on amazon.de");
  assert.ok(us.includes("tag=vialongevita-20"), "US store keeps -20");
  assert.ok(es.includes("tag=vialongevit04-21"), "ES Associates ID must win on amazon.es");
  assert.ok(fr.includes("tag=vialongevit0b-21"), "FR Club Partenaires ID must win on amazon.fr");
  assert.ok(uk.includes("tag=vialongevi074-21"), "UK Associates ID must win on amazon.co.uk");
  assert.ok(it.includes("tag=vialongevi07b-21"), "IT Affiliates ID must win on amazon.it");
  if (prevFallback === undefined) delete process.env.AFFILIATE_AMAZON_TAG;
  else process.env.AFFILIATE_AMAZON_TAG = prevFallback;
  if (prevDe === undefined) delete process.env.AFFILIATE_AMAZON_TAG_DE;
  else process.env.AFFILIATE_AMAZON_TAG_DE = prevDe;
  if (prevEs === undefined) delete process.env.AFFILIATE_AMAZON_TAG_ES;
  else process.env.AFFILIATE_AMAZON_TAG_ES = prevEs;
  if (prevFr === undefined) delete process.env.AFFILIATE_AMAZON_TAG_FR;
  else process.env.AFFILIATE_AMAZON_TAG_FR = prevFr;
  if (prevUk === undefined) delete process.env.AFFILIATE_AMAZON_TAG_UK;
  else process.env.AFFILIATE_AMAZON_TAG_UK = prevUk;
  if (prevIt === undefined) delete process.env.AFFILIATE_AMAZON_TAG_IT;
  else process.env.AFFILIATE_AMAZON_TAG_IT = prevIt;
}
assert.ok(
  getRevenueCopy("en").affiliateDisclosure.includes("As an Amazon Associate I earn from qualifying purchases.")
);
file("app/(admin)/admin/vydelky/page.tsx");
file("app/(admin)/admin/page.tsx");
file("app/(admin)/admin/categories/page.tsx");
file("lib/admin/taxonomy.ts");
file("lib/admin/overview.ts");
file("lib/auth/require-admin-access.ts");
file("lib/monetization/payout-map.ts");

{
  const hrefs = ADMIN_NAV_GROUPS.flatMap((group) => group.items.map((item) => item.href));
  assert.equal(new Set(hrefs).size, hrefs.length, "admin nav hrefs must be unique");
  assert.equal(ADMIN_NAV_ITEMS.length, hrefs.length);
  assert.ok(hrefs.includes("/admin/categories"));
  assert.ok(hrefs.includes("/admin/vydelky"));
  assert.ok(hrefs.includes("/admin/revenue"));
  assert.ok(hrefs.includes("/admin/articles"));
  assert.equal(isAdminNavActive("/admin/ads-public", "/admin/ads"), false);
  assert.equal(isAdminNavActive("/admin/ads", "/admin/ads"), true);
  assert.equal(isAdminNavActive("/admin/articles/new", "/admin/articles"), true);
  assert.equal(isAdminNavActive("/admin", "/admin"), true);
  assert.equal(isAdminNavActive("/admin/categories", "/admin"), false);
}

{
  const prev = process.env.ADMIN_GATE_PASSWORD;
  delete process.env.ADMIN_GATE_PASSWORD;
  assert.equal(getAdminGatePassword(), "David");
  assert.equal(isValidAdminGateCookie("David"), true);
  assert.equal(isValidAdminGateCookie("David3"), false);
  assert.equal(isValidAdminGateCookie(""), false);
  assert.equal(isValidAdminGateCookie(undefined), false);
  assert.equal(requiresAdminGate("/admin"), true);
  assert.equal(requiresAdminGate("/admin/categories"), true);
  assert.equal(requiresAdminGate("/admin/articles/new"), true);
  assert.equal(requiresAdminGate("/admin/login"), false);
  assert.equal(isAdminLoginPath("/admin/login"), true);
  assert.equal(isAdminLoginPath("/admin"), false);
  assert.equal(hasValidAdminGateCookie({ get: () => undefined }), false);
  assert.equal(
    hasValidAdminGateCookie({
      get: (name) => (name === ADMIN_GATE_COOKIE ? { value: "David" } : undefined),
    }),
    true
  );
  assert.equal(
    hasValidAdminGateCookie({
      get: (name) => (name === ADMIN_GATE_COOKIE_LEGACY ? { value: "David" } : undefined),
    }),
    false,
    "legacy 8h cookie must not unlock /admin"
  );
  assert.equal(hasValidAdminGateCookie({ get: () => ({ value: "x" }) }), false);
  assert.equal(ADMIN_GATE_COOKIE, "ms_admin_session");
  assert.equal(shouldBlockBot("curl/8.0", "/admin/login"), false);
  assert.equal(shouldBlockBot("curl/8.0", "/admin"), true);
  assert.equal(shouldBlockBot("Mozilla/5.0 (Windows NT 10.0) Chrome/120.0.0.0", "/admin"), false);
  const nextConfig = readFileSync(join(root, "next.config.mjs"), "utf8");
  assert.ok(nextConfig.includes('source: "/admin"'));
  assert.ok(nextConfig.includes("private, no-cache, no-store, must-revalidate"));
  if (prev === undefined) delete process.env.ADMIN_GATE_PASSWORD;
  else process.env.ADMIN_GATE_PASSWORD = prev;
}

assert.equal(slugifyCategory("Dlouhověkost"), "dlouhovekost");
assert.equal(slugifyCategory("Revmatologie"), "revmatologie");
assert.ok(EDITORIAL_TAXONOMY.some((item) => item.slug === "dlouhovekost"));
assert.ok(EDITORIAL_TAXONOMY.some((item) => item.slug === "kardiologie"));
assert.ok(EDITORIAL_TAXONOMY.some((item) => item.slug === "cardiology"));
for (const desk of V20_NZIP_CATEGORIES) {
  assert.ok(DESK_SLUGS.has(desk.slug), `missing desk ${desk.slug}`);
}
assert.ok(SPECIALTY_SLUGS.has("rheumatology"));
assert.equal(classifyCategoryRow({ slug: "kardiologie", published: 0, drafts: 0 }), "editorial-empty");
assert.equal(classifyCategoryRow({ slug: "kardiologie", published: 2, drafts: 1 }), "editorial-used");
assert.equal(classifyCategoryRow({ slug: "cardiology", published: 0, drafts: 3 }), "drafts-only");
assert.deepEqual(missingEditorialSlugs(["kardiologie"]), EDITORIAL_TAXONOMY.filter((item) => item.slug !== "kardiologie").map((item) => item.slug));
{
  const now = Date.parse("2026-09-02T12:00:00.000Z");
  const stats = aggregateAffiliateClicks(
    [
      { slug: "magnesium-glycinate", createdAt: "2026-09-01T12:00:00.000Z" },
      { slug: "magnesium-glycinate", createdAt: "2026-08-20T12:00:00.000Z" },
      { slug: "sleep-tracker", createdAt: "2026-07-01T12:00:00.000Z" },
    ],
    now
  );
  assert.equal(stats.last7, 1);
  assert.equal(stats.last30, 2);
  assert.equal(stats.top[0]?.slug, "magnesium-glycinate");
  assert.equal(stats.top[0]?.count, 2);
}
{
  const missing = editorialRowsToInsert(["kardiologie", "cardiology"]);
  assert.ok(missing.some((row) => row.slug === "dlouhovekost"));
  assert.ok(!missing.some((row) => row.slug === "kardiologie"));
  assert.equal(editorialRowsToInsert(EDITORIAL_TAXONOMY.map((item) => item.slug)).length, 0);
  assert.equal(formatStripeMinor(14900, "czk"), "149,00 CZK");
  assert.equal(formatStripeMinor(250, "eur"), "2,50 EUR");
  assert.equal(formatStripeMinor(600, "jpy"), "600 JPY");
}
file("lib/admin/ensure-taxonomy.ts");
file("lib/admin/stripe-snapshot.ts");
file("lib/monetization/heureka-affiliate.ts");
file("components/monetization/heureka-text-link.tsx");
file("components/layout/site-footer.tsx");
file("supabase/migrations/20260901193000_monetization_settings.sql");
assert.equal(parseHeurekaPositionId("haff=282255&utm_medium=affiliate"), "282255");
assert.equal(parseHeurekaPositionId('data-trixam-positionid="18420"'), "18420");
assert.equal(
  parseHeurekaPositionId('<a class="heureka-affiliate-link" data-trixam-positionid="18420" href="https://www.heureka.cz/">x</a>'),
  "18420"
);
assert.equal(parseHeurekaPositionId("18420"), "18420");
assert.equal(parseHeurekaPositionId("not-an-id"), null);
assert.equal(heurekaMarketFromUrl("https://www.heureka.cz/?h=x"), "cz");
assert.equal(heurekaMarketFromUrl("https://www.heureka.sk/?h=x"), "sk");
assert.ok(heurekaHopHtml({ destination: "https://www.heureka.cz/", positionId: "18420" }).includes("heureka-affiliate-link"));
assert.ok(heurekaHopHtml({ destination: "https://www.heureka.cz/", positionId: "18420" }).includes("18420"));
assert.ok(heurekaHopHtml({ destination: "https://www.heureka.cz/", positionId: "18420" }).includes("trixam.min.js"));
assert.ok(
  !heurekaHopHtml({
    destination: "https://www.heureka.cz/?h%5Bfraze%5D=x&haff=282255&utm_medium=affiliate",
    positionId: "282255",
  }).includes("haff=")
);
assert.ok(HEUREKA_HOP_CSP.includes("serve.affiliate.heureka.cz"));
assert.equal(DEFAULT_HEUREKA_CZ_HAFF, "282255");
assert.equal(DEFAULT_HEUREKA_CZ_TRIXAM, "282256");
assert.equal(HEUREKA_CZ_TEXT_LINK.positionId, "282256");
assert.equal(HEUREKA_CZ_TEXT_LINK.className, "heureka-hn-link");
assert.equal(HEUREKA_CZ_TEXT_LINK.href, "https://www.heureka.cz/");
assert.ok(!HEUREKA_CZ_TEXT_LINK.href.includes("utm_"));
{
  const tagged =
    "https://www.heureka.cz/?h%5Bfraze%5D=vitamin+d3+k2&haff=282255&utm_medium=affiliate";
  const clean = publicMarketplaceUrl(tagged);
  assert.ok(!clean.includes("haff="));
  assert.ok(!clean.includes("utm_medium"));
  assert.ok(clean.includes("heureka.cz"));
  assert.equal(marketplaceUrlShowsTracking(clean), false);
  assert.equal(marketplaceUrlShowsTracking(tagged), true);
  assert.ok(!publicMarketplaceUrl("https://www.amazon.de/s?k=x&tag=vialongevita-21").includes("tag="));
}
assert.equal(
  parseHeurekaPositionId(
    '<a href="http://www.heureka.cz#utm_source=medscopeglobal.com" class="heureka-hn-link" data-trixam-positionid="282256" target="_blank">Heureka.cz</a>'
  ),
  "282256"
);
assert.equal(shouldShowHeurekaTextLink("cs"), true);
assert.equal(shouldShowHeurekaTextLink("de"), false);
{
  const footerSrc = readFileSync(join(root, "components/monetization/heureka-text-link.tsx"), "utf8");
  assert.ok(footerSrc.includes('id="heureka-heu2"'), "footer keeps a hidden official HEU2 target");
  assert.ok(footerSrc.includes("HEUREKA_CZ_TEXT_LINK.className"), "official class stays on the hidden link");
  assert.ok(footerSrc.includes("preventDefault") || footerSrc.includes("e.preventDefault"));
  assert.ok(!footerSrc.includes("utm_campaign=26020"));
}
assert.ok(
  applyHeurekaHaff("https://www.heureka.cz/?h%5Bfraze%5D=magnesium", "282255").includes("haff=282255")
);
file("lib/v30/security/headers.ts");
assert.ok(
  readFileSync(join(root, "lib/v30/security/headers.ts"), "utf8").includes("serve.affiliate.heureka.cz"),
  "magazine CSP must allow Trixam"
);

assert.equal(
  classifyRevenueSurface({ title: "Spánek po padesátce", public_topic: "dlouhovekost" }),
  "public"
);
assert.equal(
  classifyRevenueSurface({ title: "Guidelines 2026", min_access_level: "physician" }),
  "physician"
);
assert.equal(classifyRevenueSurface({ med_track: "priprava", title: "Přijímačky" }), "student");
assert.equal(shouldShowAffiliate("public"), true);
assert.equal(shouldShowAffiliate("physician"), false);
assert.equal(shouldShowOrdiZapisCta("physician"), true);
assert.equal(shouldShowPublicSubscribeNudge("public", false), true);
assert.equal(shouldShowPublicSubscribeNudge("public", true), false);
{
  const sleepMix = matchAffiliateProductIds({ title: "Poruchy spánku a HRV", slug: "spanek-hrv" });
  assert.equal(sleepMix.length, AFFILIATE_SLOT_COUNTS.article);
  assert.ok(sleepMix.includes("sleep-tracker"));
}
assert.ok(matchAffiliateProductIds({ title: "Vitamin D3 v zimě", slug: "vitamin-d3" }).includes("vitamin-d3-k2"));
assert.ok(matchAffiliateProductIds({ title: "Sommeil et HRV", slug: "sommeil" }).includes("sleep-tracker"));
assert.equal(AFFILIATE_SLOT_COUNTS.homepage, 6);
assert.equal(AFFILIATE_SLOT_COUNTS.article, 4);
assert.equal(AFFILIATE_SLOT_COUNTS.articleMid, 2);
assert.equal(AFFILIATE_SLOT_COUNTS.listing, 4);
assert.equal(AFFILIATE_SLOT_COUNTS.newsletter, 3);
assert.equal(pickAffiliateProducts({ surface: "homepage", locale: "fr" }).length, AFFILIATE_SLOT_COUNTS.homepage);
assert.equal(pickAffiliateProducts({ surface: "listing", locale: "cs", topic: "dlouhovekost" }).length, AFFILIATE_SLOT_COUNTS.listing);
assert.equal(pickAffiliateProducts({ surface: "newsletter", locale: "de" }).length, AFFILIATE_SLOT_COUNTS.newsletter);
assert.equal(pickAffiliateProducts({ surface: "articleMid", locale: "cs", article: { title: "Spánek" } }).length, 2);
{
  const [lead, rest] = splitHtmlAfterParagraphs("<p>one</p><p>two</p><p>three</p>", 2);
  assert.ok(lead.includes("two"));
  assert.ok(rest.includes("three"));
}
assert.ok(getAffiliateRedirectDestination("coq10", { locale: "de" })?.includes("amazon.de"));
assert.ok(getAffiliateRedirectDestination("blue-light-glasses", { locale: "fr" })?.includes("amazon.fr"));
assert.ok(getAffiliateRedirectDestination("walking-pad", { locale: "de" })?.includes("amazon.de"));
assert.ok(getAffiliateRedirectDestination("sunrise-alarm", { locale: "it" })?.includes("amazon.it"));
assert.ok(LONGEVITY_MEDIA_KIT.some((item) => item.id === "native-banner" && item.priceCzk === 5000));
assert.ok(LONGEVITY_MEDIA_KIT.some((item) => item.id === "sponsored-article" && item.priceCzk === 15000));

file("app/api/newsletter/subscribe/route.ts");
file("components/monetization/newsletter-capture.tsx");
file("components/monetization/house-partner-slot.tsx");
file("components/monetization/article-subscribe-nudge.tsx");
file("lib/i18n/revenue-copy.ts");
file("lib/monetization/revenue-mix.ts");
file("lib/monetization/apply-schema.ts");
file("lib/monetization/revenue-ops.ts");
file("app/api/cron/revenue-ops/route.ts");
file("app/api/cron/vialongevita-brief/route.ts");
file("app/api/newsletter/unsubscribe/route.ts");
file("lib/monetization/affiliate-geo.ts");
file("lib/i18n/newsletter-copy.ts");
file("lib/monetization/vialongevita-brief.ts");
file("lib/monetization/brief-marketing.ts");
file("lib/admin/newsletter-ops.ts");
file("lib/admin/editorial-pulse.ts");
file("components/admin/editorial-pulse-strip.tsx");
file("app/api/admin/newsletter/brief/route.ts");
file("app/(admin)/admin/newsletter/page.tsx");
file("components/admin/newsletter-ops-strip.tsx");
assert.ok(!composeBriefLead("cs", ["Spánek po padesátce", "Chůze"]).includes("Spánek po padesátce"));
assert.ok(composeBriefLead("cs", ["Spánek po padesátce"]).includes("týden") || composeBriefLead("cs", []).length > 10);
assert.ok(composeBriefLead("de", ["Schlaf", "Bewegung"]).includes("Texte") || composeBriefLead("de", []).length > 10);
assert.ok(composeBriefLead("en", []).includes("Three") || composeBriefLead("en", []).length > 10);
assert.ok(composeBriefSubject("cs", ["Světelný budík a spánek"]).startsWith("ViaLongeVita"));
{
  const briefSrc = readFileSync(join(root, "lib/monetization/brief-email-layout.ts"), "utf8");
  assert.ok(briefSrc.includes("emailLockup") || briefSrc.includes("vialongevita-email-lockup"));
  assert.ok(briefSrc.includes("heroLabel"), "weekly brief must have a lead story, not a title dump");
  assert.ok(briefSrc.includes("welcomeExpect"), "welcome must set the weekly promise");
  assert.ok(briefSrc.includes("brandLine"), "every issue must close with a brand line");
}
file("public/assets/magazine/vialongevita-email-lockup.jpg");
assert.ok(
  !readFileSync(join(root, "lib/monetization/vialongevita-brief.ts"), "utf8").includes("escapeHtml(market)"),
  "brief must not show heureka-cz / amazon market labels"
);
assert.ok(
  readFileSync(join(root, "components/v271/portal-home.tsx"), "utf8").includes('source="home-hero"'),
  "homepage hero must capture the ViaLongeVita brief"
);
assert.ok(
  readFileSync(join(root, "components/v271/portal-home.tsx"), "utf8").includes("ViaLongeVitaMark"),
  "homepage hero and news box must show the ViaLongeVita lockup"
);
assert.ok(
  readFileSync(join(root, "components/v271/portal-home.tsx"), "utf8").includes("leadDate"),
  "homepage featured story must show a live publication date"
);
assert.ok(
  readFileSync(join(root, "app/(public)/articles/page.tsx"), "utf8").includes(
    "assignUniqueListingCovers"
  ),
  "/articles must unique-cover the visible mixed feed, not only the raw DB pool"
);
assert.ok(
  readFileSync(join(root, "next.config.mjs"), "utf8").includes("medscope-ui-v23.43"),
  "page cache tag must bust after the public TTFB unblock"
);
assert.ok(
  readFileSync(join(root, "lib/security/rate-limit.ts"), "utf8").includes(
    "memoryRateLimit(`public:${ip}`"
  ) &&
    readFileSync(join(root, "lib/security/rate-limit.ts"), "utf8").includes(
      "rate-limit-rpc-timeout"
    ),
  "public HTML rate limit must stay in-memory; API RPC must have a hard budget"
);
assert.ok(
  readFileSync(join(root, "lib/auth/reader-context.ts"), "utf8").includes("800") &&
    readFileSync(join(root, "lib/auth/reader-context.ts"), "utf8").includes("ANONYMOUS"),
  "reader VIP lookup must fall back to anonymous instead of hanging magazine HTML"
);
assert.ok(
  readFileSync(join(root, "lib/i18n/server-locale.ts"), "utf8").includes(
    "Skip it when middleware already stamped the locale"
  ),
  "public locale must not call cookies() when the path/header already resolved"
);
assert.ok(
  existsSync(join(root, "public/favicon.svg")) &&
    existsSync(join(root, "public/favicon.ico")) &&
    existsSync(join(root, "app/icon.svg")),
  "browsers must get a real favicon instead of the 8s HTML 404"
);
assert.ok(
  readFileSync(join(root, "app/sitemap.ts"), "utf8").includes("2_000"),
  "root sitemap must not wait on Supabase past two seconds"
);
assert.ok(
  !existsSync(join(root, "app/(public)/studenti/[slug]/page.tsx")),
  "student [slug] catch-all must not steal klub/hry/materialy from their dedicated pages"
);
assert.ok(
  readFileSync(join(root, "lib/v30/security/headers.ts"), "utf8").includes('stripped === "/studenti"') &&
    readFileSync(join(root, "next.config.mjs"), "utf8").includes("/:locale/studenti"),
  "locale-prefixed /cs/studenti HTML must be no-store so rooms do not reuse one cached body"
);
assert.ok(
  readFileSync(join(root, "lib/v30/security/headers.ts"), "utf8").includes('stripped === "/lekari"') &&
    readFileSync(join(root, "next.config.mjs"), "utf8").includes("/:locale/lekari"),
  "physician rooms must be no-store so /cs and /fr do not share one cached body"
);
assert.ok(
  readFileSync(join(root, "app/(public)/articles/page.tsx"), "utf8").includes(
    "getDemoMagazineArticles"
  ),
  "empty /articles must fall back to the demo magazine instead of a blank listing"
);
assert.ok(
  readFileSync(join(root, "lib/i18n/server-locale.ts"), "utf8").includes(
    "localeFromRequestHints"
  ),
  "request locale must prefer the path prefix over a leftover cookie"
);
assert.ok(
  readFileSync(join(root, "middleware.ts"), "utf8").includes("cookieHeaderWithLocale"),
  "middleware must stamp the path locale onto the request Cookie header"
);
assert.ok(
  readFileSync(join(root, "middleware.ts"), "utf8").includes('stripped === "/pro-lekare"') &&
    readFileSync(join(root, "next.config.mjs"), "utf8").includes("/:locale/pro-lekare"),
  "legacy /pro-lekare must 308 to the clinical desk"
);
assert.ok(
  readFileSync(join(root, "lib/v22/categories-cache.ts"), "utf8").includes(
    "header-categories-timeout"
  ) &&
    !readFileSync(join(root, "lib/v22/categories-cache.ts"), "utf8").includes(
      "ensureMedicalCategories"
    ),
  "header categories must not seed the DB or wait past the Worker budget"
);
assert.ok(
  readFileSync(join(root, "app/(public)/layout.tsx"), "utf8").includes("getStaticCopy") &&
    !readFileSync(join(root, "app/(public)/layout.tsx"), "utf8").includes("resolveConversionCopy"),
  "public layout must not hit Supabase for the nav strip on every page"
);
assert.ok(
  readFileSync(join(root, "lib/studenti/href.ts"), "utf8").includes("studentPublicHref") &&
    readFileSync(join(root, "components/studenti/student-section-nav.tsx"), "utf8").includes("StudentLink") &&
    readFileSync(join(root, "components/studenti/student-studio-desk.tsx"), "utf8").includes('href: "/studenti/klub"'),
  "student hub nav and desk chrome must be real /cs links, not dead labels"
);
assert.ok(
  readFileSync(join(root, "app/(public)/studenti/hry/page.tsx"), "utf8").includes("resolveStudyGameImageUrlSync"),
  "games room must not block on a remote image report per card"
);
assert.ok(
  readFileSync(join(root, "components/studenti/student-atelier-shell.tsx"), "utf8").includes("bg-[#f3eee6]"),
  "student rooms must share the atelier paper shell"
);
assert.ok(
  readFileSync(join(root, "app/(public)/studenti/testy/page.tsx"), "utf8").includes("StudentAtelierShell") &&
    readFileSync(join(root, "app/(public)/studenti/hry/page.tsx"), "utf8").includes("StudentAtelierShell") &&
    readFileSync(join(root, "app/(public)/studenti/materialy/page.tsx"), "utf8").includes("StudentAtelierShell") &&
    readFileSync(join(root, "app/(public)/studenti/ai-tutor/page.tsx"), "utf8").includes("StudentAtelierShell") &&
    readFileSync(join(root, "app/(public)/studenti/zebricek/page.tsx"), "utf8").includes("StudentAtelierShell") &&
    readFileSync(join(root, "app/(public)/studenti/leky/page.tsx"), "utf8").includes("StudentAtelierShell") &&
    readFileSync(join(root, "app/(public)/studenti/zkousky/page.tsx"), "utf8").includes("StudentAtelierShell") &&
    readFileSync(join(root, "components/academy/prep-value-proposition.tsx"), "utf8").includes("StudentAtelierShell"),
  "student rooms after the hub must stay in the atelier, not drop into blue SaaS chrome"
);
assert.ok(
  !readFileSync(join(root, "app/(public)/studenti/hry/page.tsx"), "utf8").includes("5 zdarma"),
  "games room must not advertise a 5-free-then-149 pack"
);
file("app/(public)/studenti/klub/page.tsx");
file("app/(public)/studenti/zebricek/page.tsx");
file("components/studenti/student-club-board.tsx");
file("lib/studenti/club.ts");
assert.ok(
  readFileSync(join(root, "app/(public)/studenti/page.tsx"), "utf8").includes("/studenti/klub"),
  "student hub must link the quiz club"
);
assert.ok(
  readFileSync(join(root, "components/studenti/student-studio-desk.tsx"), "utf8").includes('data-studio="desk"'),
  "student hub must show a product desk, not only stock photos"
);
assert.ok(
  readFileSync(join(root, "components/studenti/student-offer-dashboard.tsx"), "utf8").includes("Ateliér Student LF") ||
    readFileSync(join(root, "components/studenti/student-offer-dashboard.tsx"), "utf8").includes("Atelier Student LF"),
  "student hub copy must read as an atelier, not a discount bin"
);
assert.ok(
  readFileSync(join(root, "components/layout/site-header.tsx"), "utf8").includes("studentSurface") &&
    readFileSync(join(root, "app/(public)/layout.tsx"), "utf8").includes("initialPathname"),
  "student header CTA must be path-aware on first HTML, not only after hydration"
);
assert.equal(isStudentChromePath("/cs/studenti"), true);
assert.equal(isStudentChromePath("/de/predplatne"), false);
assert.equal(studentPublicHref("/studenti/klub"), "/cs/studenti/klub");
assert.equal(studentPublicHref("/cs/studenti/testy"), "/cs/studenti/testy");
assert.equal(studentPublicHref("/app/priprava"), "/app/priprava");
assert.equal(studentPublicHref("/predplatne#student"), "/cs/predplatne#student");
assert.ok(
  readFileSync(join(root, "app/(public)/predplatne/page.tsx"), "utf8").includes("studentIntroCharge"),
  "subscribe page must price the student card with the intro month, not FX on 149"
);
assert.ok(
  !readFileSync(join(root, "app/(public)/predplatne/page.tsx"), "utf8").includes("copy.daysFree") ||
    readFileSync(join(root, "app/(public)/predplatne/page.tsx"), "utf8").includes("copy.studentBadge"),
  "student plan card must not reuse the 14-day badge"
);
assert.ok(
  !readFileSync(join(root, "app/(public)/studenti/testy/page.tsx"), "utf8").includes("trial=1#student"),
  "student rooms must not send people to a 14-day trial"
);
assert.ok(
  readFileSync(join(root, "lib/v22/homepage-cache.ts"), "utf8").includes("pinHomepageDesks"),
  "homepage cache must reserve news before lifestyle"
);
assert.ok(
  readFileSync(join(root, "lib/v22/homepage-cache.ts"), "utf8").includes(
    "v22-homepage-public-v23-36-single-pool"
  ) &&
    !readFileSync(join(root, "lib/v22/homepage-cache.ts"), "utf8").includes(
      "getArticlesByMetadataSection"
    ),
  "homepage cache must use one listing pool, not a second Aktuality query"
);
assert.ok(
  readFileSync(join(root, "components/v271/academy-home-sections.tsx"), "utf8").includes(
    "academy-home-timeout"
  ),
  "homepage Academy fan-out must bail before the Worker CPU budget"
);
assert.ok(
  readFileSync(join(root, "lib/queries/verejnost.ts"), "utf8").includes(
    "public-articles-timeout"
  ) &&
    readFileSync(join(root, "lib/queries/verejnost.ts"), "utf8").includes(
      "options?.ensureContent === true"
    ),
  "public listings must not seed the DB on every page load"
);
assert.ok(
  readFileSync(join(root, "app/(public)/verejnost/clanky/page.tsx"), "utf8").includes('mode: "card"'),
  "/verejnost/clanky must list cards, not 80 full bodies (Worker 1102)"
);
assert.ok(
  readFileSync(join(root, "app/(public)/lekari/dokumentace/page.tsx"), "utf8").includes(
    "getDokumentaceCopy"
  ),
  "/lekari/dokumentace must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "app/(public)/ordizaznam/page.tsx"), "utf8").includes("getOrdiZaznamCopy"),
  "/ordizaznam must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "app/(public)/medipacient/page.tsx"), "utf8").includes("getMedipacientCopy"),
  "/medipacient must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "app/(public)/mediflow/page.tsx"), "utf8").includes("getMediflowCopy"),
  "/mediflow must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "components/apps/install-pwa-button.tsx"), "utf8").includes(
    "getInstallPwaCopy"
  ),
  "PWA install button must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "app/(public)/b2b/page.tsx"), "utf8").includes("getB2bPublicCopy"),
  "/b2b must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "app/(public)/firmy/cenik/page.tsx"), "utf8").includes("getB2bPublicCopy"),
  "/firmy/cenik must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "app/(public)/firmy/page.tsx"), "utf8").includes("FirmyDesk") &&
    readFileSync(join(root, "components/firmy/firmy-desk.tsx"), "utf8").includes(
      "getFirmyDeskCopy"
    ) &&
    !readFileSync(join(root, "app/(public)/firmy/page.tsx"), "utf8").includes(
      "V271HubPageView"
    ),
  "/firmy must use the company desk, not the leftover FeatureCard hub"
);
assert.ok(
  readFileSync(join(root, "components/lekari/physician-room-page.tsx"), "utf8").includes(
    "getPhysicianRoomDestinations"
  ) &&
    !readFileSync(join(root, "components/lekari/physician-room-page.tsx"), "utf8").includes(
      "localized.page.links"
    ),
  "physician rooms must end on clinical destinations, not the V271 link grid"
);
assert.ok(
  readFileSync(join(root, "app/(public)/pro-me/page.tsx"), "utf8").includes("getProMeCopy") &&
    readFileSync(join(root, "app/(public)/odborne/page.tsx"), "utf8").includes(
      "getOdborneHubCopy"
    ) &&
    readFileSync(join(root, "app/(public)/novinky/page.tsx"), "utf8").includes(
      "novinkyTagsForLocale"
    ),
  "/pro-me, /odborne and /novinky chrome must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "lib/config/main-navigation.ts"), "utf8").includes("magazineNav") &&
    readFileSync(join(root, "lib/config/main-navigation.ts"), "utf8").includes("firmyNav") &&
    readFileSync(join(root, "lib/config/main-navigation.ts"), "utf8").includes(
      "getHeaderUtilityLinks"
    ) &&
    readFileSync(join(root, "components/layout/site-header.tsx"), "utf8").includes(
      'data-nav="utility"'
    ) &&
    !readFileSync(join(root, "components/layout/site-header.tsx"), "utf8").includes(
      "xl:flex"
    ) &&
    readFileSync(join(root, "components/layout/header-navigation.tsx"), "utf8").includes(
      'data-nav="primary"'
    ) &&
    !readFileSync(join(root, "components/layout/header-navigation.tsx"), "utf8").includes(
      "overflow-x-auto"
    ) &&
    readFileSync(join(root, "components/layout/header-logo.tsx"), "utf8").includes(
      "getSurfaceCopy"
    ) &&
    !readFileSync(join(root, "components/layout/header-logo.tsx"), "utf8").includes(
      'aria-label="MedScopeGlobal — domů"'
    ),
  "top bar must show magazine, firms and every primary hub without a hidden scroll"
);
assert.ok(
  readFileSync(join(root, "lib/config/main-navigation.ts"), "utf8").includes(
    "1 test zdarma · 89 Kč, další měsíc 149 Kč"
  ),
  "student plan in the header must not sell a 14-day trial"
);
assert.ok(
  readFileSync(join(root, "app/(public)/mediprep/page.tsx"), "utf8").includes("CzechFacultyOnlyNotice"),
  "MeDiprep must stay a Czech-faculty product outside /cs"
);
assert.ok(
  readFileSync(join(root, "app/(public)/academy/layout.tsx"), "utf8").includes(
    "CzechFacultyOnlyNotice"
  ),
  "Academy must stay a Czech-faculty product outside /cs"
);
assert.ok(
  readFileSync(join(root, "app/(public)/studenti/layout.tsx"), "utf8").includes(
    "CzechFacultyOnlyNotice"
  ),
  "Student hub must stay a Czech-faculty product outside /cs"
);
assert.ok(
  readFileSync(join(root, "app/(public)/medicina/layout.tsx"), "utf8").includes(
    "CzechFacultyOnlyNotice"
  ),
  "Studium medicíny must stay a Czech-faculty product outside /cs"
);
assert.ok(
  readFileSync(join(root, "middleware.ts"), "utf8").includes("/czech-edition-only"),
  "foreign Academy/student URLs must rewrite to the courtesy page, not run Czech trees"
);
assert.ok(
  readFileSync(join(root, "app/(public)/lekari/dokumentace/page.tsx"), "utf8").includes(
    "locale={locale}"
  ),
  "OrdiZapis marketing workspace must receive the edition locale"
);
assert.ok(
  readFileSync(join(root, "app/(dok-app)/app/dokumentace/page.tsx"), "utf8").includes(
    "getServerLocale"
  ),
  "OrdiZapis PWA must receive the edition locale on first paint"
);
assert.ok(
  readFileSync(join(root, "components/lekari/dokumentace-workspace.tsx"), "utf8").includes(
    "dokumentaceLocaleHeaders"
  ),
  "OrdiZapis workspace must send the edition locale to STT/structure"
);
assert.ok(
  readFileSync(join(root, "lib/lekari/dokumentace/stt.ts"), "utf8").includes("whisperLanguage"),
  "Whisper must follow the edition language, not hard-coded Czech"
);
assert.ok(
  readFileSync(join(root, "lib/lekari/dokumentace/structure.ts"), "utf8").includes(
    "structureSystemPrompt"
  ),
  "Note structure must follow the edition language"
);
assert.equal(getOrdiZapisAppCopy("fr").dictate, "Dicter");
assert.ok(!getOrdiZapisAppCopy("fr").upload.includes("Nahrát"));
assert.equal(getOrdiZapisAppCopy("cs").tabNote, "Zápis");
assert.equal(getOrdiZapisApiCopy("fr").unauthShort.includes("Connectez"), true);
assert.ok(!getOrdiZapisApiCopy("de").notVerifiedMessage.includes("Stažení"));
assert.ok(
  readFileSync(join(root, "lib/lekari/dokumentace/eligibility.ts"), "utf8").includes(
    "getOrdiZapisApiCopy"
  ),
  "eligibility messages must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "app/api/lekari/dokumentace/eligibility/route.ts"), "utf8").includes(
    "dokumentaceLocaleFromUrl"
  ),
  "eligibility API must read the request locale"
);
assert.equal(getOrdiZapisAppCopy("fr").accessLabel, "Accès");
assert.equal(getOrdiZapisAppCopy("it").subscribeCta, "Abbonamento");
assert.ok(!getOrdiZapisAppCopy("fr").errConsent.includes("souhlas"));
assert.ok(!getOrdiZapisAppCopy("es").notSignedIn.includes("Nejste"));
assert.ok(
  readFileSync(join(root, "components/apps/app-account-status.tsx"), "utf8").includes(
    "labels?.access"
  ),
  "account strip must accept localized Access / Validity / Subscribe"
);
assert.ok(
  readFileSync(join(root, "components/lekari/dok-app/dok-app-account.tsx"), "utf8").includes(
    "locale"
  ) &&
    readFileSync(join(root, "components/lekari/dok-app/dok-app-shell.tsx"), "utf8").includes(
      "locale={locale}"
    ),
  "OrdiZapis account tab must receive the edition locale"
);
assert.ok(
  readFileSync(join(root, "components/lekari/dokumentace-workspace.tsx"), "utf8").includes(
    "copy.errConsent"
  ),
  "OrdiZapis workspace errors must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "components/lekari/dokumentace-workspace.tsx"), "utf8").includes(
    "copy.installTipTitle"
  ) &&
    readFileSync(join(root, "components/lekari/dokumentace-workspace.tsx"), "utf8").includes(
      "copy.historyLoading"
    ) &&
    !readFileSync(join(root, "components/lekari/dokumentace-workspace.tsx"), "utf8").includes(
      "OrdiZapis od 390 Kč"
    ),
  "OrdiZapis workspace install tip, history, and subscribe strip must follow the edition"
);
assert.ok(
  readFileSync(join(root, "components/lekari/ordizapis-mark.tsx"), "utf8").includes(
    "getDokumentaceCopy"
  ),
  "OrdiZapis lockup tagline must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "app/(dok-app)/app/dokumentace/page.tsx"), "utf8").includes(
    "generateMetadata"
  ),
  "OrdiZapis PWA metadata must follow the edition language"
);
assert.ok(
  !readFileSync(join(root, "components/lekari/ordizapis-audio.ts"), "utf8").includes(
    "Připravuji bezpečný upload"
  ),
  "OrdiZapis upload progress must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "lib/lekari/dokumentace/install-link.ts"), "utf8").includes(
    "ordizapisAppHref"
  ),
  "OrdiZapis QR/install URLs must carry the edition locale"
);
assert.equal(getOrdiZapisAppCopy("fr").installTipTitle, "Ajouter à l’écran d’accueil");
assert.ok(!getOrdiZapisAppCopy("de").gateDemo.includes("zápisy"));
assert.ok(getDokumentaceCopy("fr").trialLine.includes("jours"));
assert.ok(!getDokumentaceCopy("en").facilitiesLabel.includes("Zařízení"));
assert.ok(
  readFileSync(join(root, "components/lekari/ordizapis-promo-banner.tsx"), "utf8").includes(
    "ordizapisAppHref"
  ) &&
    readFileSync(join(root, "components/lekari/ordizapis-promo-banner.tsx"), "utf8").includes(
      "getDokumentaceCopy"
    ),
  "physician promo banner must open the edition PWA and use edition copy"
);
assert.ok(
  readFileSync(join(root, "components/v271/homepage-sections.tsx"), "utf8").includes(
    "copy.trialLine"
  ) &&
    !readFileSync(join(root, "components/v271/homepage-sections.tsx"), "utf8").includes(
      "Detail pro lékaře"
    ),
  "homepage OrdiZapis spotlight must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "app/api/lekari/dokumentace/manifest/route.ts"), "utf8").includes(
    "ordizapisAppHref"
  ),
  "PWA manifest must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "lib/seo/json-ld.ts"), "utf8").includes("organizationJsonLd(app.locale)") &&
    readFileSync(join(root, "app/(public)/page.tsx"), "utf8").includes("locale,"),
  "homepage app JSON-LD must pass the edition locale into the publisher"
);
assert.ok(
  readFileSync(join(root, "lib/v25/writers/writer-base.mjs"), "utf8").includes(
    "Týždenný plán v slovenskej praxi"
  ) &&
    readFileSync(join(root, "lib/v25/writers/writer-base.mjs"), "utf8").includes(
      "Never add Czech headings"
    ),
  "foreign writer depth pad must not inject Czech practice sections"
);
assert.ok(
  readFileSync(join(root, "lib/v25/writers/writer-base.mjs"), "utf8").includes(
    "locale === \"cs\" ? polishCzechArticle"
  ) &&
    readFileSync(join(root, "lib/v25/writers/writer-base.mjs"), "utf8").includes(
      "similarity-exhausted"
    ) &&
    readFileSync(join(root, "lib/v25/writers/writer-base.mjs"), "utf8").includes(
      "lockTitleToSeed"
    ) &&
    readFileSync(join(root, "lib/v25/writers/writer-base.mjs"), "utf8").includes(
      "writer_seed"
    ),
  "public writers must lock titles, skip exhausted dupes, and only Czech-polish /cs"
);
assert.ok(
  readFileSync(join(root, "lib/v26/editorial-prompts.mjs"), "utf8").includes(
    "Mammo-Czech"
  ) &&
    readFileSync(join(root, "lib/v26/editorial-prompts.mjs"), "utf8").includes(
      "Ministerstvo zdravotníctva SR"
    ),
  "writer prompts must forbid invented stats and localize SK sources"
);
assert.ok(
  readFileSync(join(root, "lib/v25/writers/run-public-writers.mjs"), "utf8").includes(
    "runTodayPublicArticleRepairs"
  ),
  "public-writer cron must repair today's already-published rows first"
);
assert.ok(
  readFileSync(join(root, "app/api/cron/public-articles/route.ts"), "utf8").includes(
    "repairOnly"
  ),
  "cron must accept a repair-only pass for already-published magazine rows"
);
assert.ok(
  readFileSync(join(root, "lib/i18n/filter-articles-for-locale.ts"), "utf8").includes(
    "relatedScore(article, ui) > 0"
  ),
  "courtesy borrow must stay on related desks, not Japanese leftovers"
);
assert.ok(
  !readFileSync(join(root, "components/v271/portal-home.tsx"), "utf8").includes("VITASCOPE.name"),
  "homepage news box must not still say Vitascope"
);
assert.ok(
  readFileSync(join(root, "components/layout/header-logo.tsx"), "utf8").includes("MAGAZINE.name"),
  "header tagline must keep ViaLongeVita visible on every breakpoint"
);
assert.ok(
  !readFileSync(join(root, "components/layout/header-logo.tsx"), "utf8").includes("hidden text-left xl:block"),
  "ViaLongeVita must not hide behind the xl breakpoint"
);
assert.ok(
  readFileSync(join(root, "components/v271/homepage-sections.tsx"), "utf8").includes("localizeListedCzk"),
  "B2B list prices must convert off Czech pages"
);
assert.ok(
  readFileSync(join(root, "lib/v271/b2b-pricing.ts"), "utf8").includes("b2bPricingForLocale"),
  "B2B pricing table must convert listed CZK off Czech pages"
);
assert.ok(
  !readFileSync(join(root, "app/(public)/pro-firmy/page.tsx"), "utf8").includes("180 000"),
  "B2B landing must not invent monthly traffic"
);
assert.ok(
  !readFileSync(join(root, "app/(public)/pro-firmy/page.tsx"), "utf8").includes("12 000"),
  "B2B landing must not invent newsletter counts"
);
assert.ok(
  !readFileSync(join(root, "lib/i18n/revenue-copy.ts"), "utf8").includes("1 300"),
  "media kit must not invent daily uniques"
);
assert.ok(
  readFileSync(join(root, "app/(public)/inzerce/page.tsx"), "utf8").includes("bannerOfferDesc"),
  "advertising offers must follow the request locale"
);
assert.ok(
  readFileSync(join(root, "app/(public)/pro-firmy/page.tsx"), "utf8").includes("getB2BLandingCopy") &&
    readFileSync(join(root, "app/(public)/pro-firmy/page.tsx"), "utf8").includes("orderCta") &&
    !readFileSync(join(root, "app/(public)/pro-firmy/page.tsx"), "utf8").includes("Objednat balíček"),
  "B2B landing chrome must not stay Czech on /de"
);
assert.ok(
  readFileSync(join(root, "app/(public)/odborne/kategorie/page.tsx"), "utf8").includes(
    "getOdborneHubCopy"
  ) &&
    readFileSync(join(root, "app/(public)/odborne/ai/page.tsx"), "utf8").includes(
      "getOdborneHubCopy"
    ) &&
    readFileSync(join(root, "app/(public)/odborne/[id]/page.tsx"), "utf8").includes(
      "getOdborneHubCopy"
    ),
  "odborne child desks must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "app/not-found.tsx"), "utf8").includes("getNotFoundCopy") &&
    !readFileSync(join(root, "app/not-found.tsx"), "utf8").includes("Stránka nebyla nalezena"),
  "root 404 chrome must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "app/(public)/ai-asistent/verejnost/page.tsx"), "utf8").includes(
    "getAiAssistantCopy"
  ) &&
    readFileSync(join(root, "app/(public)/leky/page.tsx"), "utf8").includes("getLekyHubCopy") &&
    readFileSync(join(root, "app/(public)/inzerce/formular/page.tsx"), "utf8").includes(
      "getAdRequestCopy"
    ) &&
    readFileSync(join(root, "app/(public)/odborna/page.tsx"), "utf8").includes(
      "getOdbornaHubCopy"
    ),
  "header destinations must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "app/(public)/pro-firmy/page.tsx"), "utf8").includes(
    "getV27AudienceHubCopy"
  ),
  "B2B landing title must follow the request locale"
);
assert.ok(
  readFileSync(join(root, "app/(public)/pro-lekare/page.tsx"), "utf8").includes(
    "getPhysicianLandingCopy"
  ),
  "physician landing chrome must not stay Czech on /it"
);
assert.ok(
  readFileSync(join(root, "app/(public)/aktualni-zpravy/page.tsx"), "utf8").includes(
    "newsDesksForLocale"
  ),
  "news listing chrome must follow the edition desk labels"
);
assert.ok(
  readFileSync(join(root, "components/v271/lekari-landing-extras.tsx"), "utf8").includes(
    "getPhysicianHubExtrasCopy"
  ),
  "physician hub extras must not stay Czech on /it/lekari"
);
assert.ok(
  readFileSync(join(root, "app/(public)/lekari/page.tsx"), "utf8").includes("isCzechSurface") &&
    readFileSync(join(root, "app/(public)/lekari/page.tsx"), "utf8").includes("PhysicianOfferDashboard"),
  "ČLK-accredited CME panel is Czech-only"
);
file("components/lekari/physician-offer-dashboard.tsx");
file("lib/i18n/physician-hub-dashboard-copy.ts");
file("components/lekari/physician-room-page.tsx");
file("lib/i18n/physician-room-copy.ts");
assert.ok(
  readFileSync(join(root, "app/(public)/lekari/[slug]/page.tsx"), "utf8").includes(
    "PhysicianRoomPage"
  ) &&
    readFileSync(join(root, "components/lekari/physician-room-page.tsx"), "utf8").includes(
      'data-studio="physician-room"'
    ) &&
    readFileSync(join(root, "components/lekari/physician-section-nav.tsx"), "utf8").includes(
      "translateNavHref(item.href, locale, { label: item.fallback })"
    ),
  "physician rooms must use the clinical desk, not the generic link grid"
);
assert.ok(
  readFileSync(join(root, "components/articles/magazine-listing.tsx"), "utf8").includes(
    'localizePublicHref("/articles?med_track=priprava"'
  ) &&
    readFileSync(join(root, "components/articles/magazine-listing.tsx"), "utf8").includes(
      "isCzechSurface"
    ),
  "magazine study chips must stay Czech and keep the locale prefix"
);
assert.ok(
  readFileSync(join(root, "lib/queries/articles.ts"), "utf8").includes("latest-articles-timeout") &&
    !readFileSync(join(root, "lib/queries/articles.ts"), "utf8").includes(
      "ensurePublicArticlesSeeded"
    ),
  "article listing must not seed the DB or wait past the Worker budget"
);
assert.ok(
  readFileSync(join(root, "app/(public)/articles/page.tsx"), "utf8").includes(
    "getLatestArticles(24"
  ),
  "/articles must fetch one listing page, not 48 rows"
);
assert.ok(
  readFileSync(join(root, "app/(public)/articles/archiv/page.tsx"), "utf8").includes(
    "getMagazineListingCopy"
  ) &&
    readFileSync(join(root, "app/(public)/hledat/page.tsx"), "utf8").includes(
      "getMagazineSearchCopy"
    ),
  "archive and search chrome must follow the edition language"
);
assert.ok(
  readFileSync(join(root, "app/feed/[locale]/route.ts"), "utf8").includes(
    "filterArticlesForLocale"
  ),
  "locale feeds must not mix Czech titles into every edition"
);
assert.ok(
  readFileSync(join(root, "app/api/v38/conversion-copy/route.ts"), "utf8").includes(
    "searchParams.get(\"locale\")"
  ),
  "conversion-copy API must take the edition locale, not default to Czech"
);
assert.ok(
  readFileSync(join(root, "components/lekari/physician-offer-dashboard.tsx"), "utf8").includes(
    'data-studio="physician-desk"'
  ),
  "physician hub must render the clinical desk"
);
assert.ok(
  readFileSync(join(root, "lib/ecosystem/seo.ts"), "utf8").includes("dateModified") &&
    readFileSync(join(root, "app/(public)/article/[slug]/page.tsx"), "utf8").includes("modifiedAt"),
  "article pages must expose dateModified when the desk refreshes a story"
);
assert.ok(
  readFileSync(join(root, "lib/v26/backfill.ts"), "utf8").includes("content_refreshed_at") &&
    readFileSync(join(root, "app/api/cron/v26-rewrite/route.ts"), "utf8").includes("rotate"),
  "v26 rewrite must stamp refreshed articles so listing dates stay current"
);
assert.ok(
  !readFileSync(join(root, "app/(public)/pro-lekare/page.tsx"), "utf8").includes("Sekce pro praxi"),
  "physician practice grid must come from the locale pack"
);
assert.ok(
  readFileSync(join(root, "lib/queries/articles.ts"), "utf8").includes("relatedNativeDeskArticles"),
  "related cards must pin native desk pieces instead of Czech demo"
);
assert.ok(
  readFileSync(join(root, "components/recommendations/content-recommendations.tsx"), "utf8").includes(
    "filterArticlesForLocale"
  ),
  "article recs must be native-first per locale"
);
assert.ok(
  readFileSync(join(root, "components/article/article-card.tsx"), "utf8").includes(
    "localizePublicHref"
  ),
  "related article cards must keep the edition prefix"
);
assert.ok(
  readFileSync(join(root, "lib/i18n/chrome-pack.ts"), "utf8").includes('"it"'),
  "Italian must have a dedicated chrome pack like German"
);
assert.ok(
  readFileSync(join(root, "lib/ecosystem/locales.ts"), "utf8").includes('"en-UK"'),
  "UK English must be a first-class edition with GBP"
);
assert.ok(
  !readFileSync(join(root, "components/v271/portal-home.tsx"), "utf8").includes("surface.stats"),
  "homepage must not show invented social-proof counts"
);
assert.ok(
  readFileSync(join(root, "components/v271/portal-home.tsx"), "utf8").includes('aud.id !== "student"'),
  "non-Czech homepage must hide the MeDiprep student audience"
);
assert.ok(
  readFileSync(join(root, "components/monetization/newsletter-capture.tsx"), "utf8").includes(
    "/newsletter/dekujeme"
  ),
  "successful subscribe must send readers to the thank-you page"
);
assert.ok(
  !readFileSync(join(root, "app/sitemap.ts"), "utf8").includes("/cs/article/"),
  "root sitemap must not emit CS-only article URLs"
);
assert.ok(
  readFileSync(join(root, "app/sitemap.ts"), "utf8").includes("buildRootSitemapStaticEntries"),
  "root sitemap must emit locale-prefixed magazine hubs"
);
assert.ok(
  readFileSync(join(root, "app/(public)/vip/protokoly/page.tsx"), "utf8").includes("getServerLocale"),
  "VIP protocols listing must follow the request locale"
);
assert.ok(
  readFileSync(join(root, "lib/v38/conversion-copy.ts"), "utf8").includes("10 Protokolle") &&
    readFileSync(join(root, "lib/v38/conversion-copy.ts"), "utf8").includes(
      "Pour les médecins vérifiés"
    ),
  "VIP and physician nav strips must not stay Czech on non-CS pages"
);
assert.ok(
  readFileSync(join(root, "app/(public)/layout.tsx"), "utf8").includes("navStripForPath") &&
    readFileSync(join(root, "lib/v38/conversion-copy.ts"), "utf8").includes(
      "export function navStripForPath"
    ),
  "physician header strip must be chosen on the server from the request path"
);
assert.ok(
  readFileSync(join(root, "lib/i18n/surface-copy.ts"), "utf8").includes("O redakci a zdrojích"),
  "footer proof must be qualitative, not invented reader counts"
);
assert.ok(
  !readFileSync(join(root, "lib/i18n/surface-copy.ts"), "utf8").includes("2 800+"),
  "surface copy must not ship invented professional counts"
);
assert.ok(
  readFileSync(join(root, "components/layout/site-footer.tsx"), "utf8").includes(
    "isCzechSurface(locale) ?"
  ),
  "footer must hide MeDiprep and student links outside Czech"
);
assert.ok(
  readFileSync(join(root, "lib/seo/locale-sitemap.ts"), "utf8").includes('path: "/newsletter"'),
  "locale sitemaps must list the newsletter hub"
);
assert.ok(
  readFileSync(join(root, "app/(public)/tip/page.tsx"), "utf8").includes('redirect("/articles")'),
  "/tip must not send readers to VIP protocols"
);
file("app/(public)/newsletter/dekujeme/page.tsx");
{
  const cronYml = readFileSync(join(root, ".github/workflows/cloudflare-cron.yml"), "utf8");
  assert.ok(cronYml.includes("/api/cron/newsletter-generate"), "web issue must publish on Cloudflare cron");
  assert.ok(cronYml.includes("/api/cron/conversion-renewals"), "conversion copy renewals must run on Cloudflare cron");
  assert.ok(cronYml.includes("skipAds=1") && cronYml.includes("skipCovers=1"), "public-articles cron must stay inside the Worker budget");
  assert.ok(cronYml.includes("v25-enterprise?mode=quick"), "enterprise cron must use the Worker-safe quick mode");
  assert.ok(cronYml.includes("CRITICAL FAIL"), "ingest and public-articles must fail the dispatcher when they 503");
  assert.ok(
    cronYml.includes("/api/cron/v26-rewrite") && cronYml.includes("rotate=1"),
    "existing magazine articles must rotate on Cloudflare cron, not only new drafts"
  );
}
assert.ok(
  readFileSync(join(root, "lib/v23/newsletter/render.ts"), "utf8").includes("locale = \"cs\""),
  "HTML render must accept locale for affiliate /go links"
);
assert.ok(!/srpna|srpen/i.test(newsletterHeadline("2026-08-03", "de")));
assert.ok(!/srpna|srpen/i.test(newsletterHeadline("2026-08-03", "en")));
assert.ok(/srpna|8/i.test(newsletterHeadline("2026-08-03", "cs")));
assert.ok(
  readFileSync(join(root, "app/(public)/newsletter/[slug]/page.tsx"), "utf8").includes("copy.hubArchive"),
  "issue page archive link must follow locale copy"
);
assert.ok(
  readFileSync(join(root, "app/(public)/newsletter/archiv/page.tsx"), "utf8").includes("newsletterHeadline"),
  "archive titles must follow page locale, not stored Czech issue.title"
);
assert.ok(
  readFileSync(join(root, "app/(public)/newsletter/[slug]/page.tsx"), "utf8").includes("getNewsletterForPublic"),
  "issue page must prefer locale slug then date slug"
);
assert.ok(
  readFileSync(join(root, "lib/v4c/newsletter-generate.ts"), "utf8").includes("publishNewsletterEditions"),
  "cron must publish one web issue per locale desk"
);
assert.ok(
  !readFileSync(join(root, "app/(admin)/admin/newsletter/page.tsx"), "utf8").includes(
    "se samo nasadí na všechny jazykové mutace"
  ),
  "admin must not claim one Czech issue covers every locale"
);
{
  const subscribeSrc = readFileSync(join(root, "app/api/newsletter/subscribe/route.ts"), "utf8");
  assert.ok(
    !subscribeSrc.includes("void sendViaLongeVitaWelcome"),
    "welcome mail must be awaited on Workers"
  );
  assert.ok(subscribeSrc.includes("sendViaLongeVitaFirstBrief"), "signup must send first brief now");
  const briefSrc = readFileSync(join(root, "lib/monetization/vialongevita-brief.ts"), "utf8");
  assert.ok(briefSrc.includes("export function mailReady"), "admin needs honest mail status");
  assert.ok(briefSrc.includes("__pillar"), "empty locale still gets a first brief");
  assert.ok(
    readFileSync(join(root, "wrangler.jsonc"), "utf8").includes('"send_email"'),
    "Worker must bind Cloudflare Email Sending"
  );
  assert.ok(
    readFileSync(join(root, "lib/email/from.ts"), "utf8").includes("info@medscopeglobal.com"),
    "newsletters send from info@"
  );
  file("lib/email/cloudflare-sending.ts");
  const publicRunner = readFileSync(join(root, "lib/v25/runners/public.ts"), "utf8");
  assert.ok(
    publicRunner.includes("isCloudflareRuntime"),
    "public writers must run in-process on Cloudflare, not spawnSync"
  );
  assert.ok(!publicRunner.includes("VERCEL"), "public writers must not key off Vercel");
  const uniRunner = readFileSync(join(root, "lib/v25/runners/universities.ts"), "utf8");
  assert.ok(
    uniRunner.includes("isCloudflareRuntime"),
    "universities cron must run in-process on Cloudflare"
  );
  assert.ok(!uniRunner.includes("VERCEL"), "universities cron must not key off Vercel");
  const healthSrc = readFileSync(join(root, "app/api/health/route.ts"), "utf8");
  assert.ok(!healthSrc.includes("VERCEL"), "/api/health must not report a Vercel runtime");
  const mw = readFileSync(join(root, "middleware.ts"), "utf8");
  assert.ok(mw.includes("cf-ipcountry"), "geo locale uses Cloudflare country");
  assert.ok(!mw.includes("x-vercel-ip-country"), "geo locale must not use Vercel country header");
  const opsSrc = readFileSync(join(root, "lib/admin/newsletter-ops.ts"), "utf8");
  assert.ok(opsSrc.includes("writersProduced24h"), "admin must show live writers, not roster as daily");
  assert.ok(opsSrc.includes("waitingFirstBrief"), "admin must show unsent first briefs");
  const articlesAdmin = readFileSync(join(root, "app/(admin)/admin/articles/page.tsx"), "utf8");
  assert.ok(articlesAdmin.includes("published_at"), "admin article list must show dates");
  assert.ok(articlesAdmin.includes("cover_image_url"), "admin article list must show covers");
}
file("lib/v23/newsletter/locale-editions.ts");
file("lib/v23/newsletter/locale-layout.ts");
file("lib/editorial/magazine-category-copy.ts");
assert.equal(newsletterIssueSlug("2026-09-03", "cs"), "2026-09-03");
assert.equal(newsletterIssueSlug("2026-09-03", "pt-BR"), "2026-09-03-pt-br");
assert.equal(newsletterIssueSlug("2026-09-03", "zh-CN"), "2026-09-03-cn");
assert.equal(parseNewsletterIssueSlug("2026-09-03").locale, "cs");
assert.equal(parseNewsletterIssueSlug("2026-09-03-pt-br").locale, "pt-BR");
assert.equal(parseNewsletterIssueSlug("2026-09-03-jp").locale, "ja");
assert.deepEqual(publicNewsletterSlugCandidates("2026-09-03", "de"), ["2026-09-03-de", "2026-09-03"]);
assert.ok(NEWSLETTER_PRIMARY_LOCALES.includes("pt"));
assert.ok(NEWSLETTER_PRIMARY_LOCALES.includes("pt-BR"));
assert.equal(NEWSLETTER_PRIMARY_LOCALES.length, PRIMARY_EDITORIAL_LOCALES.length);
{
  const cats = magazineCategoriesForLocale("pt-BR");
  assert.equal(cats.length, 5);
  assert.ok(cats.every((cat) => !looksLikeCzech(cat.title) && !looksLikeCzech(cat.intro)));
  const empty: LocaleMagazineSources = {
    locale: "pt-BR",
    studies: [],
    articles: [],
    legislation: [],
    digitalHealth: [],
    drugs: [],
    universities: [],
    pendingTopics: [],
    byCategory: {
      "zivotni-styl": [],
      nemoci: [],
      prevence: [],
      rozhovory: [],
      dlouhovekost: [],
    },
  };
  const layout = buildLocaleMagazineLayout(empty, "2026-09-03", "pt-BR");
  assert.equal(layout.locale, "pt-BR");
  assert.equal(layout.sections.length, 5);
  assert.ok(!looksLikeCzech(layout.intro));
  assert.ok(layout.sections.every((sec) => !looksLikeCzech(sec.title) && sec.items.length > 0));
  const deLayout = buildLocaleMagazineLayout({ ...empty, locale: "de" }, "2026-09-03", "de");
  assert.ok(!looksLikeCzech(deLayout.intro));
  assert.ok(deLayout.sections.some((sec) => /Lebensstil|Schlaf|Prävention|Langlebigkeit/i.test(sec.title)));
}
assert.ok(
  readFileSync(join(root, "app/(admin)/admin/page.tsx"), "utf8").includes("Odběratelé briefu")
);
file("public/assets/affiliate/supplement.svg");
file("public/assets/affiliate/bottle.svg");
file("public/assets/affiliate/device.svg");
file("public/assets/affiliate/powder.svg");
file("public/assets/affiliate/wellness.svg");
file("public/assets/affiliate/glasses.svg");
file("public/assets/affiliate/blanket.svg");
file("public/assets/affiliate/coq10.svg");
file("public/assets/affiliate/grip.svg");
file("public/assets/affiliate/ring.svg");
file("public/assets/affiliate/bp.svg");
file("public/assets/affiliate/alarm.svg");
file("public/assets/affiliate/walk.svg");
file("public/assets/affiliate/cherry.svg");
file("public/assets/affiliate/scale.svg");
file("lib/monetization/split-article-html.ts");
assert.ok(
  readFileSync(join(root, "app/(public)/page.tsx"), "utf8").includes("HomepageAffiliateShelf"),
  "homepage must show the product shelf above ads"
);
assert.ok(
  !readFileSync(join(root, "components/monetization/homepage-revenue-mix.tsx"), "utf8").includes(
    "TopLongevityProducts"
  ),
  "homepage must not repeat the product rail below ads"
);
assert.ok(NEWSLETTER_SUBSCRIBERS_SQL.includes("newsletter_subscribers"));
assert.ok(NEWSLETTER_SUBSCRIBERS_SQL.includes("create table if not exists"));
assert.ok(NEWSLETTER_SUBSCRIBERS_SQL.includes("unsubscribed_at"));
assert.ok(NEWSLETTER_SUBSCRIBERS_SQL.includes("last_brief_sent_at"));
assert.ok(
  readFileSync(join(root, "lib/monetization/apply-schema.ts"), "utf8").includes("cloudflare"),
  "email_logs must accept Cloudflare provider"
);

assert.ok(AD_INVENTORY.some((e) => e.id === "article-below-title"));
assert.ok(AD_INVENTORY.some((e) => e.surface === "homepage"));
assert.ok(AD_INVENTORY.some((e) => e.surface === "app-landing"));
const adCfg = getClientAdConfig();
assert.equal(typeof adCfg.enabled, "boolean");
assert.equal(isAdSenseEnabled(), true);
assert.equal(resolveAdSenseClientId(), "ca-pub-6820104998820692");
assert.equal(adCfg.enabled, true);
assert.equal(adCfg.adsenseClientId, ADSENSE_PUBLISHER_ID);
assert.equal(resolveAdSenseSlotId("below-title"), null);
assert.equal(resolveAdSenseSlotId("in-content"), null);
assert.equal(resolveAdSenseSlotId("in-article"), ADSENSE_SLOT_IN_ARTICLE);
assert.equal(ADSENSE_SLOT_IN_ARTICLE, "2911384114");
assert.equal(adsAllowedOnPath("/de"), true);
assert.equal(adsAllowedOnPath("/en/article/sleep"), true);
assert.equal(adsAllowedOnPath("/cs/newsletter"), true);
assert.equal(adsAllowedOnPath("/verejnost/osveta"), true);
assert.equal(adsAllowedOnPath("/admin"), false);
assert.equal(adsAllowedOnPath("/de/lekari/dokumentace"), false);
assert.equal(adsAllowedOnPath("/ordizaznam"), false);
assert.equal(adsAllowedOnPath("/studenti"), false);
assert.equal(adsAllowedOnPath("/go/vitamin-d3"), false);
assert.ok(ADSENSE_ADS_TXT.includes("pub-6820104998820692"));
assert.ok(existsSync(join(root, "public/ads.txt")));
assert.ok(readFileSync(join(root, "public/ads.txt"), "utf8").includes("pub-6820104998820692"));
assert.ok(
  readFileSync(join(root, "app/layout.tsx"), "utf8").includes("google-adsense-account")
);
assert.ok(
  readFileSync(join(root, "app/layout.tsx"), "utf8").includes("application/rss+xml"),
  "every page must advertise the locale RSS feed"
);
assert.ok(
  readFileSync(join(root, "app/layout.tsx"), "utf8").includes("/llms.txt"),
  "every page must point assistants at llms.txt"
);
assert.ok(
  readFileSync(join(root, "app/(public)/articles/page.tsx"), "utf8").includes(
    "newsDesksForLocale"
  ),
  "article listing titles must follow the request locale"
);
assert.ok(
  readFileSync(join(root, "lib/v30/security/headers.ts"), "utf8").includes(
    "pagead2.googlesyndication.com"
  )
);
assert.ok(
  readFileSync(join(root, "lib/v30/security/headers.ts"), "utf8").includes(
    "fundingchoicesmessages.google.com"
  ),
  "CSP must allow Google Funding Choices CMP"
);
assert.ok(
  readFileSync(join(root, "lib/v30/security/headers.ts"), "utf8").includes(
    "*.google-analytics.com"
  ),
  "CSP must allow GA4 regional collect hosts, not only www"
);
assert.ok(
  readFileSync(join(root, "components/monetization/adsense-head.tsx"), "utf8").includes(
    "adsbygoogle.js?client="
  ),
  "AdSense snippet must load in public layout for verification + CMP"
);
assert.ok(
  readFileSync(join(root, "components/monetization/adsense-head.tsx"), "utf8").includes(
    "path && !adsAllowedOnPath(path)"
  ),
  "AdSense head must stay off only when the path is known and blocked"
);
assert.ok(
  !readFileSync(join(root, "components/analytics/consent-scripts.tsx"), "utf8").includes(
    "enable_page_level_ads"
  ),
  "legacy page-level ads push must not fight the official client= snippet"
);
assert.ok(
  readFileSync(join(root, "lib/v30/security/headers.ts"), "utf8").includes(
    "*.adtrafficquality.google"
  ) &&
    readFileSync(join(root, "lib/v30/security/headers.ts"), "utf8").includes(
      "www.googletagservices.com"
    ) &&
    readFileSync(join(root, "lib/v30/security/headers.ts"), "utf8").includes("worker-src"),
  "CSP must allow current AdSense hosts and blob workers"
);
assert.ok(
  readFileSync(join(root, "app/layout.tsx"), "utf8").includes("AdSenseHead"),
  "official AdSense snippet must sit in the document head"
);
assert.equal(isGoogleAnalyticsEnabled(), true);
assert.equal(resolveGaMeasurementId(), "G-6DX8RC4VZ1");
assert.equal(GA_MEASUREMENT_ID, "G-6DX8RC4VZ1");
assert.ok(
  readFileSync(join(root, "app/layout.tsx"), "utf8").includes("GoogleTagHead"),
  "official Google tag must sit in the document head"
);
assert.ok(
  readFileSync(join(root, "components/analytics/google-tag-head.tsx"), "utf8").includes(
    "www.googletagmanager.com/gtag/js"
  ),
  "Google tag must load the official gtag.js so collect leaves the browser"
);
assert.ok(
  !readFileSync(join(root, "components/analytics/google-tag-head.tsx"), "utf8").includes(
    "transport_url:"
  ) &&
    !readFileSync(join(root, "lib/analytics.ts"), "utf8").includes("transport_url:") &&
    !readFileSync(join(root, "lib/analytics.ts"), "utf8").includes("first_party_collection"),
  "do not send collect through the Worker hop — GA4 drops Cloudflare IPs as bots"
);
assert.ok(
  readFileSync(join(root, "lib/analytics/ga.ts"), "utf8").includes('"/relay"'),
  "same-origin gtag.js fallback path must stay available"
);
assert.ok(
  existsSync(join(root, "app/relay/[...path]/route.ts")),
  "first-party GA hop route must exist"
);
assert.ok(
  !existsSync(join(root, "app/__ms/[...path]/route.ts")),
  "do not put the GA hop under a Next.js private _folder"
);
assert.ok(
  readFileSync(join(root, "middleware.ts"), "utf8").includes("relay"),
  "locale middleware must not rewrite the GA hop"
);
assert.ok(
  readFileSync(join(root, "components/analytics/google-tag-head.tsx"), "utf8").includes(
    "analytics_storage: 'granted'"
  ),
  "EEA visits must send page_view before Funding Choices CMP exists"
);
assert.ok(
  readFileSync(join(root, "components/analytics/google-tag-head.tsx"), "utf8").includes(
    "ad_storage: 'granted'"
  ),
  "AdSense must not start with ad_storage denied"
);
assert.ok(
  !readFileSync(join(root, "components/analytics/google-tag-head.tsx"), "utf8").includes(
    "ad_storage: 'denied'"
  ),
  "do not block AdSense behind a denied default"
);
assert.ok(
  readFileSync(join(root, "components/analytics/google-tag-head.tsx"), "utf8").includes(
    "G-6DX8RC4VZ1"
  ) ||
    readFileSync(join(root, "components/analytics/google-tag-head.tsx"), "utf8").includes(
      "resolveGaMeasurementId"
    ),
  "Google tag must use the owner measurement id"
);
assert.ok(
  !readFileSync(join(root, "components/analytics/google-tag-head.tsx"), "utf8").includes(
    "next/script"
  ),
  "do not hide gtag behind Next.js Script preload"
);
assert.ok(
  !readFileSync(join(root, "components/analytics/consent-scripts.tsx"), "utf8").includes(
    "googletagmanager.com/gtag/js"
  ),
  "do not load a second Google tag from ConsentScripts"
);
assert.ok(
  readFileSync(join(root, "wrangler.jsonc"), "utf8").includes("G-6DX8RC4VZ1"),
  "Cloudflare vars must carry the owner GA id"
);
assert.ok(
  !readFileSync(join(root, "components/monetization/adsense-head.tsx"), "utf8").includes(
    "next/script"
  ),
  "do not hide the snippet behind Next.js Script preload"
);
assert.ok(
  !readFileSync(join(root, "components/analytics/consent-scripts.tsx"), "utf8").includes(
    "marketing && allowAds"
  ),
  "homemade marketing gate must not block Google CMP"
);
assert.ok(
  readFileSync(join(root, "app/robots.ts"), "utf8").includes("/ads.txt"),
  "robots must allow ads.txt"
);
{
  const robotsSrc = readFileSync(join(root, "app/robots.ts"), "utf8");
  const crawlerSrc = readFileSync(join(root, "lib/seo/ai-crawlers.ts"), "utf8");
  assert.ok(robotsSrc.includes("AI_CRAWLER_NAMES"), "robots must invite assistant crawlers");
  assert.ok(crawlerSrc.includes("GPTBot"), "GPTBot must be on the allow list");
  assert.ok(crawlerSrc.includes("PerplexityBot"), "PerplexityBot must be on the allow list");
  assert.ok(robotsSrc.includes("/llms.txt"), "robots must allow the citation card");
  assert.ok(
    !robotsSrc.includes('disallow: ["/"]'),
    "assistant crawlers must be allowed to read ViaLongeVita"
  );
}
file("app/llms.txt/route.ts");
file("app/news-sitemap.xml/route.ts");
assert.ok(
  !readFileSync(join(root, "app/news-sitemap.xml/route.ts"), "utf8").includes(
    'runtime = "edge"'
  ),
  "news sitemap must stay on the Workers server runtime"
);
assert.ok(
  readFileSync(join(root, "lib/seo/news-sitemap.ts"), "utf8").includes("news:news"),
  "Google News sitemap must emit news:news entries"
);
assert.ok(
  readFileSync(join(root, "lib/seo/news-sitemap.ts"), "utf8").includes("MAGAZINE.name"),
  "Google News publication name must be ViaLongeVita"
);
assert.ok(
  readFileSync(join(root, "lib/seo/news-sitemap.ts"), "utf8").includes("NEWS_SITEMAP_URL_CAP"),
  "Google News sitemap must stay under the 1000-URL cap"
);
assert.ok(
  readFileSync(join(root, "lib/seo/news-sitemap.ts"), "utf8").includes('.lte("published_at"'),
  "Google News sitemap must drop future publication dates"
);
assert.ok(
  readFileSync(join(root, "app/robots.ts"), "utf8").includes("newsSitemapUrl()"),
  "robots must list the Google News sitemap"
);
assert.ok(
  readFileSync(join(root, "lib/seo/llms-txt.ts"), "utf8").includes("How to cite"),
  "llms.txt must tell assistants how to cite ViaLongeVita"
);
assert.ok(
  readFileSync(join(root, "lib/ecosystem/tip-copy.ts"), "utf8").includes(
    "další čtenář"
  ),
  "Czech tip copy must frame a gift as helping the next reader"
);
assert.ok(
  readFileSync(join(root, "lib/v30/security/headers.ts"), "utf8").includes(
    "X-Robots-Tag"
  ),
  "admin must not be indexed"
);
assert.ok(
  readFileSync(join(root, "app/(public)/pravo/page.tsx"), "utf8").includes(
    "Povolení k užití"
  ),
  "reuse permission stays with the operator only"
);
assert.ok(existsSync(join(root, "COPYRIGHT")));
assert.ok(
  readFileSync(join(root, "middleware.ts"), "utf8").includes("PATHNAME_REQUEST_HEADER"),
  "locale rewrite must pass the original path so AdSense stays off pro routes"
);
assert.ok(
  readFileSync(join(root, "middleware.ts"), "utf8").includes("cf-ipcountry"),
  "apex locale must use Cloudflare country as a tie-breaker for US English"
);
assert.ok(
  readFileSync(join(root, "components/legal/cookie-banner.tsx"), "utf8").includes(
    "googleCmpOwnsAds"
  ),
  "first-party banner must yield to Google CMP on magazine paths"
);
assert.ok(
  !readFileSync(join(root, "app/(public)/ordizaznam/page.tsx"), "utf8").includes("GlobalAdSlot"),
  "physician landing must stay AdSense-free"
);
const articlePageSrc = readFileSync(join(root, "app/(public)/article/[slug]/page.tsx"), "utf8");
assert.ok(
  readFileSync(join(root, "app/(public)/page.tsx"), "utf8").includes("MagazineAdUnit"),
  "homepage /cs must render a real AdSense unit, not an empty placement"
);
assert.ok(
  readFileSync(join(root, "components/monetization/magazine-ad-unit.tsx"), "utf8").includes(
    "2911384114"
  ) ||
    readFileSync(join(root, "components/monetization/magazine-ad-unit.tsx"), "utf8").includes(
      "ADSENSE_SLOT_IN_ARTICLE"
    ),
  "homepage magazine unit must use the owner AdSense slot"
);
assert.ok(
  articlePageSrc.includes("ADSENSE_SLOT_IN_ARTICLE"),
  "public article must use the owner in-article slot"
);
assert.ok(
  articlePageSrc.includes('placement="in-article"'),
  "article unit must be the official in-article placement"
);
assert.ok(
  readFileSync(join(root, "lib/monetization/adsense.ts"), "utf8").includes("2911384114"),
  "owner in-article slot id must stay 2911384114"
);
assert.ok(
  readFileSync(join(root, "components/monetization/global-ad-slot.tsx"), "utf8").includes(
    '"data-ad-layout": "in-article"'
  ),
  "in-article unit must keep Google layout=in-article + fluid"
);
assert.ok(
  !readFileSync(join(root, "components/monetization/global-ad-slot.tsx"), "utf8").includes(
    "marketingOk"
  ),
  "homemade marketing cookie must not gate the in-article unit"
);
for (const guarded of [
  "components/monetization/homepage-revenue-mix.tsx",
  "app/(public)/mediflow/page.tsx",
  "app/(public)/medipacient/page.tsx",
  "app/(public)/ordizaznam/page.tsx",
]) {
  assert.ok(
    !readFileSync(join(root, guarded), "utf8").includes("2911384114"),
    `${guarded} must not reuse the in-article slot`
  );
}
assert.equal(shouldShowDisplayAds("public", false), true);
assert.equal(shouldShowDisplayAds("public", true), false);
assert.equal(shouldShowDisplayAds("physician", false), false);
assert.equal(shouldShowDisplayAds("student", false), false);

file("app/api/ecosystem/editorial/images/route.ts");
file("lib/ecosystem/editorial/images/policy.ts");
file("lib/ecosystem/editorial/images/matcher.ts");
file("scripts/editorial/backfill-article-images.mjs");
file("app/api/cron/ecosystem-generate-articles/route.ts");
file("app/api/cron/ecosystem-syndicate/route.ts");
file("lib/ecosystem/editorial/desks.ts");
file("lib/ecosystem/editorial/syndication.ts");

assert.equal(EDITORIAL_DESKS.length, GLOBAL_LOCALES.length, "desk per global locale");
assert.ok(PRIMARY_EDITORIAL_LOCALES.includes("fr"), "fr is primary desk");
assert.ok(PRIMARY_EDITORIAL_LOCALES.includes("zh-CN"), "zh-CN is primary desk");
assert.equal(getDeskForLocale("cs").id, "desk-cz");
assert.equal(getPrimaryDesks().length, PRIMARY_EDITORIAL_LOCALES.length);
assert.ok(getSyndicationTargets("en").length >= 1, "en syndication rules");
assert.ok(
  SYNDICATION_RULES.some((r) => r.targetLocales.includes("ja")),
  "ja is a syndication target"
);
{
  const item = createEditorialQueueItem(
    "desk-cz",
    "cs",
    "longevity",
    "journalist-longevity-cz",
    "generate"
  );
  assert.equal(item.taskType, "generate");
  assert.equal(item.status, "queued");
}
console.log(
  `✓ editorial desks=${EDITORIAL_DESKS.length} primary=${PRIMARY_EDITORIAL_LOCALES.length} syndicationRules=${SYNDICATION_RULES.length}`
);

assert.equal(isMissingOrStaleHeroImage(null), true);
assert.equal(isMissingOrStaleHeroImage(""), true);
assert.equal(isMissingOrStaleHeroImage("https://images.unsplash.com/photo-1"), true);
assert.equal(
  isMissingOrStaleHeroImage(
    "https://xcydgqnivxfhprbmdyym.supabase.co/storage/v1/object/public/media/v25-images/images/verejnost/doctor-phone.webp"
  ),
  true
);
  assert.equal(isMissingOrStaleHeroImage("/assets/covers/food.webp"), false);
  assert.equal(
    isMissingOrStaleHeroImage("/assets/covers/clinical.webp"),
    false
  );

{
  const foodCover = resolveArticleCoverUrl({
    title: "Středomořský talíř v české kuchyni",
    slug: "verejnost-zivotni-styl-stredomorsky-talir",
    coverImageUrl:
      "https://xcydgqnivxfhprbmdyym.supabase.co/storage/v1/object/public/media/v25-images/images/verejnost/doctor-phone.webp",
    preferCurated: true,
  });
  assert.ok(foodCover?.startsWith("/assets/covers/"), `food cover local, got ${foodCover}`);
  assert.ok(
    foodCover?.includes("food") || foodCover?.includes("produce"),
    `food topic cover, got ${foodCover}`
  );
  assert.equal(classifyCoverTopic({ title: "Středomořský talíř", slug: "stredomorsky" }), "food");

  // Magazine hubs must hide under-800w stubs (cron drafts + briefs), not only seeds.
  assert.equal(MAGAZINE_LISTING_MIN_WORDS, 800);
  assert.equal(
    shouldHideFromPublicListing({
      title: "Krátký stub",
      slug: "verejnost-nemoci-2026-06-15-sezonni-alergie-jak-se-pripravit-na-jaro-co-stoji-za-to-vedet-jeste-dnes",
      vip_only: false,
      content: "<p>" + "slovo ".repeat(250) + "</p>",
    }),
    true,
    "cron draft under 800w must be hidden from listings"
  );
  assert.equal(
    shouldHideFromPublicListing({
      title: "Plný magazine článek",
      slug: "verejnost-zivotni-styl-2026-06-23-stredomorsky-talir-v-ceske-kuchyni-vyvazena-strava-bez-extremu",
      vip_only: false,
      content: "<p>" + "slovo ".repeat(900) + "</p>",
    }),
    false,
    "800+ word magazine article stays listable"
  );
  assert.equal(
    shouldHideFromPublicListing(getDemoMagazineArticles()[0]!),
    false,
    "demo magazine fallback cards must stay listable when the DB times out"
  );
  assert.deepEqual(
    filterMagazineListableArticles([
      {
        title: "Seed",
        slug: "verejnost-prevence-screening-a-ockovani",
        vip_only: false,
        content: "<p>" + "slovo ".repeat(120) + "</p>",
      },
      {
        title: "Long",
        slug: "verejnost-zivotni-styl-2026-08-01-long",
        vip_only: false,
        content: "<p>" + "slovo ".repeat(900) + "</p>",
      },
    ]).map((a) => a.slug),
    ["verejnost-zivotni-styl-2026-08-01-long"]
  );
  {
    // Regression: a single EN byline token must not collapse magazine Czech HTML on /cs.
    const longCzech = `<h2>Zahradní slavnost na talíři</h2>
<p>Představte si talíř plný zeleniny, kousek ryby a olivový olej — středomořský model jde skvěle přeložit do české kuchyně bez extrémů a bez dietního stresu.</p>
<p>Polovina talíře zelenina, čtvrtina příloha, čtvrtina bílkovina. Mražená zelenina, luštěniny ve skle a jeden pečený recept na více porcí stačí i po směně.</p>
<p>MedScopeGlobal AI-Assisted Editorial Team (AI-asistovaná syntéza obsahu) · Životní styl</p>
${"<p>Další praktický odstavec o nákupním seznamu, týdenním plánu a mýtech versus realitě v běžné české domácnosti.</p>".repeat(12)}`;
    const polished = polishCzechFields(
      {
        title: "Středomořský talíř na českém stole",
        excerpt: "Vyvážená strava bez extrémů",
        content: longCzech,
      },
      "cs"
    );
    const words = String(polished.content ?? "")
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
    assert.ok(
      words >= 200,
      `polishCzechFields must keep long Czech body, got ${words} words`
    );
    assert.ok(
      !/Konkrétní shrnutí zahraniční zprávy pro české lékaře/i.test(String(polished.content)),
      "must not replace magazine body with foreign-news teaser stub"
    );
  }
  {
    // Regression: a few EN citation stopwords in an otherwise Czech magazine body
    // (e.g. WHO guideline title) must not collapse /cs/article HTML.
    const withCitation = `<h2>Slunce na talíři</h2>
<p>Středomořská kuchyně není jen o jídle, je to životní styl, který vědci zkoumají už desítky let.</p>
<p>Podle WHO – Guidelines on diet, nutrition and physical activity for the prevention of noncommunicable diseases European Society of Cardiology – jde o model s jasným přínosem.</p>
<p>Polovina talíře zelenina, čtvrtina příloha, čtvrtina bílkovina. Mražená zelenina a luštěniny ve skle stačí i po směně.</p>
${"<p>Další praktický odstavec o nákupním seznamu, týdenním plánu a mýtech versus realitě v běžné české domácnosti bez dietního stresu.</p>".repeat(14)}`;
    const polished = polishCzechFields(
      {
        title: "Středomořská dieta: Váš recept na dlouhověkost",
        excerpt: null,
        content: withCitation,
      },
      "cs"
    );
    const words = String(polished.content ?? "")
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
    assert.ok(
      words >= 200,
      `polishCzechFields must keep Czech body with EN citation, got ${words} words`
    );
    assert.ok(
      !/Konkrétní shrnutí zahraniční zprávy pro české lékaře/i.test(String(polished.content)),
      "EN citation must not trigger foreign-news body stub"
    );
    assert.ok(
      !/Konkrétní shrnutí zahraniční zprávy pro české lékaře/i.test(String(polished.excerpt ?? "")),
      "magazine excerpt must not be foreign-news stub when body is kept"
    );
  }
  assert.equal(
    classifyCoverTopic({
      title: "Bílkoviny ke každému jídlu: Klíč k síle, sytosti a vitalitě v české kuchyni",
      slug: "verejnost-zivotni-styl-2026-08-20-bilkoviny-ke-kazdemu-jidlu-klic-k-sile-sytosti-a-vitalite-v-ceske-kuchyni",
    }),
    "food"
  );
  assert.equal(
    classifyCoverTopic({
      title: "Bílkoviny u každého jídla: klíč k síle, sytosti a dlouhověkosti",
      slug: "verejnost-zivotni-styl-2026-08-20-bilkoviny-u-kazdeho-jidla-klic-k-sile-sytosti-a-dlouhovekosti",
    }),
    "food"
  );
  assert.equal(
    classifyCoverTopic({
      title: "Bílkoviny: klíč k síle a sytosti — proč je senioři potřebují víc",
      slug: "verejnost-zivotni-styl-2026-08-14-bilkoviny-klic-k-sile-a-sytosti-v-ceske-kuchyni-proc-je-seniori-potrebuji-vic",
    }),
    "food"
  );

  const proteinFromResearch = resolveArticleCoverUrl({
    title: "Bílkoviny ke každému jídlu: Klíč k síle, sytosti a vitalitě v české kuchyni",
    slug: "verejnost-zivotni-styl-2026-08-20-bilkoviny-ke-kazdemu-jidlu-klic-k-sile-sytosti-a-vitalite-v-ceske-kuchyni",
    coverImageUrl: "/assets/covers/research-2.webp",
    preferCurated: true,
  });
  assert.ok(
    isFoodCoverUrl(proteinFromResearch ?? ""),
    `bilkoviny must remap research-2.webp → food cover, got ${proteinFromResearch}`
  );
  assert.ok(
    !isClinicalOrBrainCoverUrl(proteinFromResearch ?? ""),
    `bilkoviny must not keep clinical/research stock, got ${proteinFromResearch}`
  );

  const mediterraneanFromClinical = resolveArticleCoverUrl({
    title: "Vyvážená strava bez extrémů: středomořský talíř v české kuchyni",
    slug: "verejnost-zivotni-styl-vyziva-bez-extremu",
    coverImageUrl: "/assets/covers/clinical.webp",
    preferCurated: true,
  });
  assert.ok(
    mediterraneanFromClinical?.includes("food") ||
      mediterraneanFromClinical?.includes("produce"),
    `Mediterranean must not keep clinical.webp, got ${mediterraneanFromClinical}`
  );

  const brainStock = resolveArticleCoverUrl({
    title: "Středomořský talíř",
    slug: "test-brain-stock",
    coverImageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200",
    preferCurated: true,
  });
  assert.ok(
    brainStock?.includes("food") || brainStock?.includes("produce"),
    `brain-on-stick denied, got ${brainStock}`
  );

  const sleepCover = resolveArticleCoverUrl({
    title: "Zimní spánek a odpočinek",
    slug: "verejnost-zivotni-styl-zimni-spanek",
    coverImageUrl:
      "https://xcydgqnivxfhprbmdyym.supabase.co/storage/v1/object/public/media/v25-images/images/verejnost/x.webp",
    preferCurated: true,
  });
  assert.ok(sleepCover?.includes("sleep") || sleepCover?.includes("calm"), `sleep cover, got ${sleepCover}`);

  assert.equal(
    classifyCoverTopic({
      title: "Zimní únava: mýty o pitném režimu",
      slug: "verejnost-zivotni-styl-2026-07-29-zimni-unava-myty-o-pitnem",
    }),
    "sleep"
  );

  // Sedentary / NEAT slug must classify as movement even with generic title + zivotni-styl topic.
  assert.equal(
    classifyCoverTopic({
      title: "Zdraví v každodenním rytmu: Praktické rady pro každého",
      slug: "verejnost-zivotni-styl-2026-08-19-sedave-zamestnani-kdyz-se-divame-na-skutecne-reseni-neat-schody-stani",
      publicTopic: "zivotni-styl",
    }),
    "movement"
  );
  const sedentaryCover = resolveArticleCoverUrl({
    title: "Zdraví v každodenním rytmu: Praktické rady pro každého",
    slug: "verejnost-zivotni-styl-2026-08-19-sedave-zamestnani-kdyz-se-divame-na-skutecne-reseni-neat-schody-stani",
    publicTopic: "zivotni-styl",
    coverImageUrl: "/assets/covers/calm-2.webp",
    preferCurated: true,
  });
  assert.ok(
    sedentaryCover?.includes("movement"),
    `sedentary NEAT must remap calm → movement cover, got ${sedentaryCover}`
  );

  // Excerpt “bez zbytečného stresu” must not steal Mediterranean / food heroes to calm.
  assert.equal(
    classifyCoverTopic({
      title: "Středomořská dieta v Česku: Jak si ji přizpůsobit bez exotiky a selským rozumem",
      slug: "verejnost-zivotni-styl-2026-07-03-stredomorsky-talir-v-ceske-kuchyni-vyvazena-strava-bez-extremu",
      excerpt:
        "Zapomeňte na složité recepty a drahé ingredience. Středomořská strava může být snadno součástí vašeho jídelníčku i v české kotlině. Objevte, jak si vychutnat její benefity s lokálními surovinami a bez zbytečného stresu.",
    }),
    "food"
  );
  const mediterraneanFromCalm = resolveArticleCoverUrl({
    title: "Středomořská dieta v Česku: Jak si ji přizpůsobit bez exotiky a selským rozumem",
    slug: "verejnost-zivotni-styl-2026-07-03-stredomorsky-talir-v-ceske-kuchyni-vyvazena-strava-bez-extremu",
    excerpt:
      "Objevte benefity s lokálními surovinami a bez zbytečného stresu.",
    coverImageUrl: "/assets/covers/calm-2.webp",
    preferCurated: true,
  });
  assert.ok(
    isFoodCoverUrl(mediterraneanFromCalm ?? ""),
    `Mediterranean + stres excerpt must remap calm-2 → food, got ${mediterraneanFromCalm}`
  );
  // Title-level únava still wins over food keywords in the same title.
  assert.equal(
    classifyCoverTopic({
      title: "Zimní únava: mýty o pitném režimu, které vás okrádají o energii",
      slug: "verejnost-zivotni-styl-2026-07-29-zimni-unava-myty-o-pitnem-rezimu-ktere-vas-okradaji-o-energii",
      excerpt: "Pitný režim a strava v zimě — bez zbytečného stresu.",
    }),
    "sleep"
  );

  // Cover mismatch sweep: excerpt calm must not steal diabetes / kids / prevence titles.
  assert.equal(
    classifyCoverTopic({
      title: "Cukrovka 2. typ: klíčová zjištění a praktický průvodce",
      slug: "verejnost-nemoci-2026-07-27-cukrovka-2-typu-jak-zit-plnohodnotne-s-chronickym-onemocnenim",
      excerpt: "Přinášíme pohled na cukrovku 2. typu bez zbytečného stresu a se konkrétními kroky.",
    }),
    "clinical"
  );
  assert.equal(
    classifyCoverTopic({
      title: "Školní zvonění a sirény imunity: Jak vyzbrojit děti na podzimní nápor",
      slug: "verejnost-zivotni-styl-2026-08-03-navrat-do-skoly-a-imunita-deti-jak-zajistit-nejlepsi-ochranu",
      excerpt: "Prázdniny končí a s nimi i klidné dny. Jakmile se třídy znovu naplní…",
    }),
    "walk"
  );
  assert.equal(
    classifyCoverTopic({
      title: "Jak si vybudovat pevné zdraví: 5 pilířů pro život plný energie",
      slug: "verejnost-prevence-2026-06-14-prevence-kardiovaskularnich-onemocneni-prakticke-rady-pro-kazdodenni-zdravi",
      excerpt: "Unavuje vás kolísání energie? Objevte praktické kroky a dietní návyky bez extrémů.",
    }),
    "research"
  );
  assert.equal(
    classifyCoverTopic({
      title: "Menopauza a kosti: rozhovor s gynekologem o HRT, mýtech a screeningu",
      slug: "verejnost-rozhovory-2026-08-14-menopauza-a-kosti-rozhovor-s-gynekologem-o-hrt-mytech-a-screeningu",
    }),
    "seniors"
  );
  assert.equal(classifyCoverTopic({ title: "Mediterranean plate without extremes", slug: "mediterranean-plate" }), "food");
  assert.equal(classifyCoverTopic({ title: "Longévité et healthspan au quotidien", slug: "longevite-healthspan" }), "seniors");
  assert.equal(
    classifyCoverTopic({
      title: "Rozhovor: jak pečovat o klidný podvečer",
      slug: "verejnost-rozhovory-klidny-podvecer",
      publicTopic: "rozhovory",
    }),
    "calm"
  );
  assert.equal(
    classifyCoverTopic({ title: "WHO and EMA recommendation on air quality", slug: "who-ema-air" }),
    "research"
  );

  const diabetesFromCalmAbs = resolveArticleCoverUrl({
    title: "Cukrovka 2. typ: klíčová zjištění a praktický průvodce",
    slug: "verejnost-nemoci-2026-07-27-cukrovka-2-typu",
    excerpt: "Bez zbytečného stresu.",
    coverImageUrl: "https://medscopeglobal.com/assets/covers/calm-2.webp",
    preferCurated: true,
  });
  assert.ok(
    diabetesFromCalmAbs?.includes("clinical") ||
      diabetesFromCalmAbs?.includes("research") ||
      diabetesFromCalmAbs?.includes("vitals"),
    `diabetes must remap absolute calm-2 → clinical pool, got ${diabetesFromCalmAbs}`
  );

  const kidsFromCalm = resolveArticleCoverUrl({
    title: "Školní zvonění a sirény imunity: Jak vyzbrojit děti na podzimní nápor",
    slug: "verejnost-zivotni-styl-2026-08-03-navrat-do-skoly-a-imunita-deti",
    excerpt: "Prázdniny končí a s nimi i klidné dny.",
    coverImageUrl: "/assets/covers/calm.webp",
    preferCurated: true,
  });
  assert.ok(
    kidsFromCalm?.includes("walk") || kidsFromCalm?.includes("movement"),
    `kids/school must remap calm → walk/movement, got ${kidsFromCalm}`
  );

  const menopauseCover = resolveArticleCoverUrl({
    title: "Menopauza a kosti: rozhovor s gynekologem o HRT",
    slug: "verejnost-rozhovory-2026-08-14-menopauza-a-kosti",
    coverImageUrl:
      "https://xcydgqnivxfhprbmdyym.supabase.co/storage/v1/object/public/media/v25-images/images/verejnost/x.webp",
    preferCurated: true,
  });
  assert.ok(
    /^\/assets\/covers\/(seniors|walk)\.webp(\?|$)/.test(menopauseCover ?? ""),
    `menopause stale stock → seniors pool, got ${menopauseCover}`
  );

  assert.equal(
    resolveArticleCoverUrl({
      title: "x",
      coverImageUrl: "https://via.placeholder.com/800",
      preferCurated: true,
    })?.startsWith("/assets/covers/"),
    true
  );

  assert.notEqual(MARKETING_VISUALS.mediflow, MARKETING_VISUALS.medipacient);
  assert.ok(APP_MARKETING_IMAGE.mediflow.includes("mediflow.webp"));
  assert.ok(APP_MARKETING_IMAGE.medipacient.includes("medipacient.webp"));
  assert.ok(existsSync(join(root, "public/assets/covers/food.webp")));
  assert.ok(existsSync(join(root, "public/assets/marketing/mediflow.webp")));
}

const longevityArticle = {
  id: "a1",
  slug: "longevity-spani-test",
  title: "Dlouhověkost a kvalitní spánek pro aktivní stárnutí",
  excerpt: "Jak spánek ovlivňuje zdraví seniorů a prevenci",
};
assert.equal(inferArticleTopic(longevityArticle), "longevity");
assert.equal(inferVisualTopic(longevityArticle), "sleep");

const matched = matchImageForArticleSync(longevityArticle);
assert.ok(matched?.url, "matcher returns image url");
assert.ok(
  matched!.url.includes("sleep") || matched!.url.includes("calm"),
  `sleep article gets sleep/calm cover, got ${matched!.url}`
);
assert.ok(matched!.altTextCs.includes("Ilustra"), "czech alt text");
const compliance = validateImageCompliance({
  url: matched!.url,
  altTextCs: matched!.altTextCs,
  altTextEn: matched!.altTextEn,
  topic: matched!.topic,
  articleTitle: longevityArticle.title,
  articleSlug: longevityArticle.slug,
  excerpt: longevityArticle.excerpt,
  visualTopic: inferVisualTopic(longevityArticle),
});
assert.equal(compliance.passed, true, "curated image passes compliance");

const foodArticle = {
  id: "a2",
  slug: "verejnost-zivotni-styl-stredomorsky-talir",
  title: "Středomořský talíř v české kuchyni: výživa pro dlouhověkost",
  excerpt: "Jak sestavit vyvážený talíř podle středomořské stravy",
};
assert.equal(inferVisualTopic(foodArticle), "food");
const foodMatched = matchImageForArticleSync(foodArticle);
assert.ok(foodMatched?.url, "food matcher returns url");
assert.ok(isFoodCoverUrl(foodMatched!.url), `food article gets food cover, got ${foodMatched!.url}`);
assert.ok(!isClinicalOrBrainCoverUrl(foodMatched!.url), "food article must not get clinical/brain cover");
const foodCompliance = validateImageCompliance({
  url: foodMatched!.url,
  altTextCs: foodMatched!.altTextCs,
  altTextEn: foodMatched!.altTextEn,
  topic: foodMatched!.topic,
  articleTitle: foodArticle.title,
  articleSlug: foodArticle.slug,
  excerpt: foodArticle.excerpt,
  visualTopic: "food",
});
assert.equal(foodCompliance.passed, true, "food cover passes compliance");
assert.equal(
  validateImageCompliance({
    url: "/assets/covers/clinical.webp",
    altTextCs: "Ilustrační foto k článku o stravě — zdravý životní styl",
    altTextEn: "Illustration for nutrition article — healthy lifestyle",
    topic: "lifestyle",
    articleTitle: foodArticle.title,
    visualTopic: "food",
  }).passed,
  false,
  "clinical cover rejected for food title"
);

const BRAIN_ON_STICK =
  "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200";
const SAGITTAL_BRAIN =
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200";
const DOCTOR_PHONE_UNSPLASH =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200";
const DOCTOR_PHONE =
  "https://xcydgqnivxfhprbmdyym.supabase.co/storage/v1/object/public/media/v25-images/images/verejnost/doctor-phone.webp";

assert.equal(
  validateImageCompliance({
    url: BRAIN_ON_STICK,
    altTextCs: "Ilustrační foto k článku — zdravý životní styl",
    altTextEn: "Illustration for article — healthy lifestyle",
    topic: "lifestyle",
    articleTitle: foodArticle.title,
    articleSlug: foodArticle.slug,
    visualTopic: "food",
  }).passed,
  false,
  "brain-on-stick denied in compliance gate"
);
assert.equal(
  validateImageCompliance({
    url: DOCTOR_PHONE,
    altTextCs: "Ilustrační foto k článku — zdravý životní styl",
    altTextEn: "Illustration for article — healthy lifestyle",
    topic: "lifestyle",
    articleTitle: foodArticle.title,
    visualTopic: "food",
  }).passed,
  false,
  "doctor-phone v25 stock denied in compliance gate"
);
assert.ok(isDeniedEditorialImageUrl(BRAIN_ON_STICK), "brain-on-stick in deny helper");
assert.ok(isDeniedEditorialImageUrl(SAGITTAL_BRAIN), "sagittal brain-on-stick in deny helper");
assert.ok(isDeniedEditorialImageUrl(DOCTOR_PHONE_UNSPLASH), "doctor-on-phone unsplash in deny helper");
assert.ok(isDeniedEditorialImageUrl(DOCTOR_PHONE), "doctor-phone in deny helper");

{
  const sharedSeniors = "/assets/covers/seniors.webp";
  const unique = assignUniqueListingCovers([
    {
      id: "bone-1",
      title: "Kosti ve středním věku: pohyb, pád a vitamin D",
      slug: "kosti-ve-strednim-veku",
      excerpt: "Osteoporóza a zdraví kostí.",
      cover_image_url: sharedSeniors,
      metadata: {},
    },
    {
      id: "osteo-2",
      title: "Silné kosti pro celý život — Jak předcházet osteoporóze",
      slug: "silne-kosti-osteoporoza",
      excerpt: "Prevence osteoporózy u žen i mužů.",
      cover_image_url: sharedSeniors,
      metadata: {},
    },
    {
      id: "senior-3",
      title: "Péče o seniora s duševní nemocí",
      slug: "pece-o-seniora",
      excerpt: "Rodina a stárnutí bez zázračných slibů.",
      cover_image_url: sharedSeniors,
      metadata: {},
    },
  ]);
  const keys = unique.map((article) => coverIdentity(article.cover_image_url));
  assert.equal(new Set(keys).size, 3, `neighbouring longevity cards must get distinct covers, got ${keys.join(", ")}`);
  const laterReuse = assignUniqueListingCovers(
    Array.from({ length: 5 }, (_, index) => ({
      id: `repeat-${index}`,
      title: "Osteoporóza a stárnutí kostí",
      slug: `osteo-repeat-${index}`,
      excerpt: "Healthspan a kosti.",
      cover_image_url: sharedSeniors,
      metadata: {},
    })),
    { neighbourWindow: 5 }
  ).map((article) => coverIdentity(article.cover_image_url));
  for (let i = 1; i < laterReuse.length; i += 1) {
    const window = laterReuse.slice(Math.max(0, i - 5), i);
    assert.equal(
      window.includes(laterReuse[i]!),
      false,
      `cover ${laterReuse[i]} repeats inside neighbour window at ${i}: ${window.join(",")}`
    );
  }
  assert.equal(
    (unique[0]?.metadata as Record<string, unknown> | undefined)?.editorial_image_review,
    "ai_editor"
  );
  const interviews = assignUniqueListingCovers([
    {
      id: "qa-1",
      title: "Q&A s lékárníkem — volně prodejná rada",
      slug: "qa-lekarnik",
      excerpt: "Klid a stres v lékárně.",
      cover_image_url: "/assets/covers/calm.webp",
    },
    {
      id: "qa-2",
      title: "Mindfulness po noční směně",
      slug: "mindfulness-smena",
      excerpt: "Relaxace a stres u sester.",
      cover_image_url: "/assets/covers/calm.webp",
    },
    {
      id: "qa-3",
      title: "Pohoda po práci v ambulanci",
      slug: "pohoda-ambulance",
      excerpt: "Wellness bez zázračných slibů.",
      cover_image_url: "/assets/covers/calm.webp",
    },
  ]);
  const interviewFamilies = interviews.map((article) => coverVisualFamily(article.cover_image_url));
  assert.equal(
    new Set(interviewFamilies).size,
    3,
    `neighbouring calm/interview cards must not share one photo, got ${interviewFamilies.join(", ")}`
  );
  const foodPair = assignUniqueListingCovers([
    {
      id: "food-a",
      title: "Středomořský talíř v české kuchyni",
      slug: "talir-a",
      cover_image_url: "/assets/covers/food.webp",
    },
    {
      id: "food-b",
      title: "Středomořská snídaně bez extrémů",
      slug: "talir-b",
      cover_image_url: "/assets/covers/food.webp",
    },
  ]);
  assert.ok(isFoodCoverUrl(foodPair[0]!.cover_image_url ?? ""), "food stays in food pool");
  assert.ok(isFoodCoverUrl(foodPair[1]!.cover_image_url ?? ""), "second food card stays food");
  assert.notEqual(
    coverIdentity(foodPair[0]?.cover_image_url),
    coverIdentity(foodPair[1]?.cover_image_url),
    "adjacent food cards must not share the same plate photo"
  );
  const skippedSleep = matchImageForArticleSync(longevityArticle, undefined, {
    excludeUrls: ["/assets/covers/sleep.webp", "/assets/covers/calm-2.webp"],
  });
  assert.ok(skippedSleep?.url, "matcher still returns a cover when first pool images are taken");
  assert.ok(
    !skippedSleep!.url.includes("sleep.webp"),
    `excluded sleep.webp must not win, got ${skippedSleep!.url}`
  );
}

const policyFoodMatched = matchImageForArticleSync(foodArticle);
assert.ok(policyFoodMatched?.url, "matcher returns food hero");
assert.ok(
  !isDeniedEditorialImageUrl(policyFoodMatched!.url),
  `matcher must not return denied stock, got ${policyFoodMatched!.url}`
);
assert.ok(isFoodCoverUrl(policyFoodMatched!.url), "food article remapped to food pool");

const politicsBlocked = scanTextForBlockedTopics("political election rally health");
assert.ok(politicsBlocked.some((t) => /politic/i.test(t)));

const curator = getImageCuratorForLocale("cs");
assert.equal(curator?.role, "image_curator");

const alt = getArticleHeroAltText({ title: longevityArticle.title, excerpt: longevityArticle.excerpt }, "cs");
assert.ok(alt.length > 20);

assert.equal(publicEditorialByline("cs"), "Redakce MedScopeGlobal");
assert.equal(formatEditorialUnitDisplay("medscope_cz_analyzy", "cs", true), "Redakce MedScopeGlobal");
assert.equal(
  polishMagazineTitle("Prevence: Kdy vyhledat odbornou pomoc: Mentální prevence a duševní pohoda"),
  "Kdy vyhledat odbornou pomoc — Mentální prevence a duševní pohoda"
);
assert.ok(
  !/srozumitelně a bez zbytečného strašení/i.test(
    polishMagazineExcerpt(
      "Screening rakoviny — srozumitelný průvodce pro každého. Srozumitelně a bez zbytečného strašení.",
      "Screening rakoviny v Česku"
    )
  )
);
const desk = applyMagazineDeskCopy({
  slug: "verejnost-prevence-2026-06-23-dusevni-pohoda-kdy-vyhledat-odbornou-pomoc",
  title: "Duševní pohoda: Kdy vyhledat odbornou pomoc?",
  excerpt: "Čtěte o tom, jak udržet svou duševní pohodu.",
  content: "<p>AI-asistovaná syntéza obsahu</p>",
});
assert.equal(
  desk.title,
  MAGAZINE_DESK_OVERRIDES["verejnost-prevence-2026-06-23-dusevni-pohoda-kdy-vyhledat-odbornou-pomoc"]!.title
);
assert.ok((desk.content ?? "").includes("Praktický lékař"));
assert.ok(!(desk.content ?? "").includes("AI-asistovaná"));
{
  const named =
    "Cesta zpět k životu — Příběh MUDr. Nováka po infarktu. Děkujeme MUDr. Novákovi. Novák se rozhodl promluvit.";
  const anon = anonymizeClinicianNames(named);
  assert.equal(anon.includes("Novák"), false);
  assert.ok(anon.includes("MUDr. L. Ř."));
  assert.ok(anon.includes("L. Ř."));
  const polished = applyMagazineDeskCopy({
    slug: "verejnost-rozhovory-2026-07-03-cesta-zpet-k-zivotu-pribeh-mudr-novaka-po-infarktu",
    title: "Příběh MUDr. Nováka po infarktu",
    excerpt: "MUDr. Novák, praktický lékař, sdílí svůj příběh.",
    content: "<p>MUDr. Novák se vrátil do ambulance.</p>",
  });
  assert.equal(polished.slug, "verejnost-rozhovory-2026-07-03-cesta-zpet-k-zivotu-pribeh-lekare-po-infarktu");
  assert.equal(polished.title.includes("Novák"), false);
  assert.ok(polished.title.includes("MUDr. L. Ř."));
  assert.equal(polished.excerpt.includes("Novák"), false);
  assert.equal(polished.content?.includes("Novák"), false);
  assert.equal(
    resolveCanonicalArticleSlug(polished.slug ?? ""),
    "verejnost-rozhovory-2026-07-03-cesta-zpet-k-zivotu-pribeh-mudr-novaka-po-infarktu"
  );
  assert.equal(
    publicArticleSlug(
      "verejnost-rozhovory-2026-07-03-cesta-zpet-k-zivotu-pribeh-mudr-novaka-po-infarktu"
    ),
    polished.slug
  );
}
assert.ok(
  Object.keys(MAGAZINE_DESK_OVERRIDES).filter((slug) => MAGAZINE_DESK_OVERRIDES[slug]?.content).length >= 8
);
console.log("✓ magazine desk byline and copy checks passed");

{
  assert.equal(true, isLongevityArticle({
    title: "Prevence osteoporózy u žen i mužů: vápník, vitamin D, pohyb",
    slug: "verejnost-prevence-2026-07-02-prevence-osteoporozy-u-zen-i-muzu-vapnik-vitamin-d-pohyb",
  }));
  assert.equal(true, isLongevityArticle({
    title: "10 minut denně: jak zaneprázdnění rodiče mohou zůstat fit",
    slug: "verejnost-zivotni-styl-2026-07-02-10-minut-denne-jak-zaneprazdneni-rodice-mohou-zustat-fit-bez-posilovny",
  }));
  assert.equal(true, isLongevityArticle({
    title: "Cesta zpět k životu po infarktu",
    slug: "verejnost-rozhovory-2026-07-02-cesta-zpet-k-zivotu-jak-se-vratit-k-aktivnimu-zivotu-po-infarktu",
  }));
  assert.equal(false, isLongevityArticle({
    title: "Jak se účinně bránit sezónním alergiím",
    slug: "verejnost-nemoci-2026-07-02-jaro-v-plnem-rozkvetu-jak-se-ucinne-branit-sezonnim-alergiim",
  }));
  assert.equal(
    classifyNewsDesk({
      title: "Prevence osteoporózy u žen i mužů",
      slug: "osteo-desk",
      excerpt: "Vápník, vitamin D a pohyb.",
    } as never),
    "dlouhovekost"
  );
  const longBody = Array.from({ length: 820 }, () => "slovo").join(" ");
  const desks = splitNewsDesks([
    {
      id: "osteo-1",
      title: "Prevence osteoporózy u žen i mužů",
      slug: "verejnost-prevence-2026-07-02-osteoporozy",
      excerpt: "Vápník, vitamin D a pohyb pro zdravé kosti.",
      content: longBody,
      published: true,
      published_at: "2026-07-02T10:00:00.000Z",
      vip_only: false,
      locale: "cs",
      audience: "public",
      public_topic: "prevence",
    } as never,
    {
      id: "alergie-1",
      title: "Jak se bránit sezónním alergiím",
      slug: "verejnost-nemoci-2026-07-02-alergie",
      excerpt: "Pyl a antihistaminika v praxi.",
      content: longBody,
      published: true,
      published_at: "2026-07-02T10:00:00.000Z",
      vip_only: false,
      locale: "cs",
      audience: "public",
      public_topic: "nemoci",
    } as never,
  ]);
  assert.equal(desks.dlouhovekost.length, 1);
  assert.equal(desks.dlouhovekost[0]?.slug, "verejnost-prevence-2026-07-02-osteoporozy");
  assert.equal(hubTopicListingHref("dlouhovekost", "zivotni-styl"), "/verejnost/clanky?topic=dlouhovekost");
  assert.equal(
    classifyNewsDesk({
      title: "NIH: nová zpráva o stárnutí a healthspanu",
      slug: "nih-aging-news",
      excerpt: "WHO guideline k biologickému věku.",
      metadata: { section: "aktuální-zprávy", content_pillar: "dlouhovekost" },
    } as never),
    "novinky"
  );
  const newsLongevityDesks = splitNewsDesks([
    {
      id: "longevity-news-1",
      title: "Nová zpráva NIH o stárnutí",
      slug: "nih-starnuti-zprava",
      excerpt: "Guideline WHO k healthspanu.",
      content: longBody,
      published: true,
      published_at: "2026-09-01T08:00:00.000Z",
      vip_only: false,
      locale: "cs",
      audience: "public",
      public_topic: "dlouhovekost",
      metadata: { section: "aktuální-zprávy", content_pillar: "dlouhovekost" },
    } as never,
    {
      id: "alergie-news-1",
      title: "Jak se bránit sezónním alergiím",
      slug: "alergie-news",
      excerpt: "Pyl a antihistaminika v praxi.",
      content: longBody,
      published: true,
      published_at: "2026-09-01T09:00:00.000Z",
      vip_only: false,
      locale: "cs",
      audience: "public",
      public_topic: "nemoci",
    } as never,
  ]);
  assert.ok(
    newsLongevityDesks.novinky.some((article) => article.id === "longevity-news-1"),
    "Aktuality / Novinky must include longevity news"
  );
  const toppedUp = splitNewsDesks([
    {
      id: "only-osteo",
      title: "Prevence osteoporózy u žen i mužů",
      slug: "osteo-topup",
      excerpt: "Vápník, vitamin D a pohyb.",
      content: longBody,
      published: true,
      published_at: "2026-09-01T10:00:00.000Z",
      vip_only: false,
      locale: "cs",
      audience: "public",
      public_topic: "prevence",
    } as never,
  ]);
  assert.equal(toppedUp.novinky.length, 0);
  assert.equal(toppedUp.dlouhovekost[0]?.id, "only-osteo");
  const pageKeys = [
    ...toppedUp.novinky,
    ...toppedUp.verejnost,
    ...toppedUp.dlouhovekost,
    ...toppedUp.clanky,
  ].map((article) => article.id);
  assert.equal(new Set(pageKeys).size, pageKeys.length, "homepage desks must not repeat a story");
  const olderAllergy = {
    id: "old-alergie",
    title: "Jak se bránit sezónním alergiím v domácnosti",
    slug: "verejnost-nemoci-2026-06-01-alergie-doma",
    excerpt: "Pyl a antihistaminika v praxi.",
    content: longBody,
    published: true,
    published_at: "2026-06-01T10:00:00.000Z",
    vip_only: false,
    locale: "cs",
    audience: "public",
    public_topic: "nemoci",
  } as never;
  const filled = splitNewsDesks([
    {
      id: "who-now",
      title: "WHO: nová doporučení k očkování seniorů",
      slug: "who-ockovani-2026-09-04",
      excerpt: "Aktuální guideline.",
      content: longBody,
      published: true,
      published_at: "2026-09-04T08:00:00.000Z",
      vip_only: false,
      locale: "cs",
      audience: "public",
      rubric_slug: "aktualni-zpravy",
    } as never,
    olderAllergy,
  ]);
  assert.equal(filled.novinky[0]?.id, "who-now");
  assert.equal(filled.verejnost.some((article) => article.id === "old-alergie"), true);
  assert.ok(
    !filled.novinky.some((article) => article.id === "old-alergie"),
    "older category pieces must not also sit in news"
  );
  assert.ok(filled.verejnost.find((article) => article.id === "old-alergie")?.listing_published_at);
  assert.equal(filled.novinky[0]?.listing_published_at, undefined);
  const rolled = rollEvergreenListingDate(
    { slug: "old-piece", published_at: "2026-06-01T10:00:00.000Z" },
    new Date("2026-09-04T12:00:00.000Z")
  );
  assert.ok(rolled && rolled.slice(0, 10) >= "2026-08-28" && rolled.slice(0, 10) <= "2026-09-04");
  assert.equal(
    articleDisplayDate({
      published_at: "2026-06-01T10:00:00.000Z",
      updated_at: "2026-09-04T08:00:00.000Z",
    }),
    "2026-09-04T08:00:00.000Z"
  );
  assert.equal(
    articleWasRefreshed({
      published_at: "2026-06-01T10:00:00.000Z",
      updated_at: "2026-09-04T08:00:00.000Z",
    }),
    true
  );
  const mixed = mixListableFeed(
    [
      {
        id: "old-lifestyle",
        title: "Spánek a krevní tlak u dospělých",
        slug: "spanek-tlak",
        excerpt: "Pravidelný spánek.",
        content: longBody,
        published: true,
        published_at: "2026-06-01T10:00:00.000Z",
        vip_only: false,
        locale: "cs",
        audience: "public",
        public_topic: "zivotni-styl",
      } as never,
    ],
    4
  );
  assert.ok(
    mixed[0]?.listing_published_at,
    "/articles feed must roll evergreen listing dates like the homepage"
  );
  const layout = uniqueHomepageLayout(
    [
      {
        id: "long-a",
        title: "Prevence osteoporózy u žen i mužů",
        slug: "osteo-a",
        excerpt: "Vápník a pohyb.",
        content: longBody,
        published: true,
        published_at: "2026-09-04T10:00:00.000Z",
        vip_only: false,
        locale: "cs",
        audience: "public",
        public_topic: "prevence",
      } as never,
      {
        id: "long-b",
        title: "Healthspan: spánek a biologický věk",
        slug: "healthspan-b",
        excerpt: "Spánek jako pilíř dlouhověkosti.",
        content: longBody,
        published: true,
        published_at: "2026-08-01T10:00:00.000Z",
        vip_only: false,
        locale: "cs",
        audience: "public",
        public_topic: "dlouhovekost",
      } as never,
    ],
    "cs"
  );
  const visible = [
    ...layout.desks.novinky,
    ...layout.desks.verejnost,
    ...layout.desks.dlouhovekost,
    ...layout.desks.clanky,
    ...layout.longevityReading,
  ].map((article) => articlePageKey(article));
  assert.equal(new Set(visible).size, visible.length, "homepage + longevity strip must be unique at the same time");
  assert.ok(layout.desks.dlouhovekost.length + layout.longevityReading.length >= 2);
  const pinned = pinHomepageDesks(
    [
      {
        id: "who-pin",
        title: "WHO: nová doporučení k očkování seniorů",
        slug: "who-pin-2026-09-04",
        excerpt: "Aktuální guideline.",
        content: longBody,
        published: true,
        published_at: "2026-09-04T08:00:00.000Z",
        vip_only: false,
        locale: "cs",
        audience: "public",
        rubric_slug: "aktualni-zpravy",
      } as never,
      {
        id: "osteo-pin",
        title: "Prevence osteoporózy u žen i mužů",
        slug: "osteo-pin",
        excerpt: "Vápník a pohyb.",
        content: longBody,
        published: true,
        published_at: "2026-09-04T09:00:00.000Z",
        vip_only: false,
        locale: "cs",
        audience: "public",
        public_topic: "prevence",
      } as never,
      {
        id: "alergie-pin",
        title: "Jak se bránit sezónním alergiím v domácnosti",
        slug: "alergie-pin",
        excerpt: "Pyl a antihistaminika.",
        content: longBody,
        published: true,
        published_at: "2026-09-04T10:00:00.000Z",
        vip_only: false,
        locale: "cs",
        audience: "public",
        public_topic: "nemoci",
      } as never,
    ],
    8,
    "cs"
  );
  assert.equal(pinned[0]?.id, "who-pin", "pinHomepageDesks must reserve news first");
  assert.equal(new Set(pinned.map((article) => article.id)).size, pinned.length);
  assert.equal(normalizeStudentNick(" BioChem@18!! "), "BioChem18");
  assert.equal(STUDENT_CLUB_FREE_RUNS, 1);
  assert.equal(STUDENT_FREE_TESTS, 1);
  assert.equal(canStartClubRun(0, false), true);
  assert.equal(canStartClubRun(1, false), false);
  assert.equal(canStartClubRun(5, false), false);
  assert.equal(canStartClubRun(99, true), true);
  assert.equal(remainingFreeRuns(0, false), 1);
  assert.equal(studentIntroCharge("cs").unitAmount, 8900);
  assert.equal(studentMonthlyCharge("cs").unitAmount, 14900);
  assert.equal(studentMonthlyCharge("de").unitAmount, 1000);
  assert.equal(studentIntroCharge("fr").unitAmount, 600);
  assert.equal(facultyCountryForLocale("de"), "de");
  assert.ok(facultiesForLocale("sk").length >= 3);
  assert.ok(facultiesForLocale("fr").some((f) => f.applicationUrl.includes("parcoursup")));
  assert.deepEqual(
    rankClubScores([
      { nick: "Alpha", score: 3, total: 8, at: "2026-09-01T10:00:00.000Z" },
      { nick: "alpha", score: 7, total: 8, at: "2026-09-02T10:00:00.000Z" },
      { nick: "Beta", score: 6, total: 8, at: "2026-09-03T10:00:00.000Z" },
    ]).map((row) => row.nick),
    ["Alpha", "Beta"]
  );
  assert.equal(studentClubOpenFromProfile({ isVip: false, accessLevel: "public" }), false);
  assert.equal(studentClubOpenFromProfile({ isVip: false, accessLevel: "student" }), true);
  assert.equal(studentClubOpenFromProfile({ isVip: true, accessLevel: "public" }), true);
  assert.equal(isStudentGrantProduct("student-month"), true);
  assert.equal(isStudentGrantProduct("physician-month"), false);
  assert.equal(isPhysicianGrantProduct("dokumentace-year"), true);
  assert.ok(
    readFileSync(join(root, "app/api/stripe/webhook/route.ts"), "utf8").includes(
      "grantStudentClubAccess"
    ),
    "Stripe webhook must unlock the student quiz club"
  );
  file("components/novinky/novinky-tag-listing.tsx");
  const lifestyleOnly = splitNewsDesks([
    {
      id: "snack-1",
      title: "Svačiny ve směnném provozu — energie bez cukrového kolotoče",
      slug: "svaciny-smena",
      excerpt: "Jídlo mezi směnami.",
      content: longBody,
      published: true,
      published_at: "2026-09-04T11:00:00.000Z",
      vip_only: false,
      locale: "cs",
      audience: "public",
      public_topic: "vyziva",
    } as never,
    {
      id: "who-keep",
      title: "WHO: nová doporučení k očkování seniorů",
      slug: "who-keep",
      excerpt: "Guideline.",
      content: longBody,
      published: true,
      published_at: "2026-09-04T08:00:00.000Z",
      vip_only: false,
      locale: "cs",
      audience: "public",
      rubric_slug: "aktualni-zpravy",
    } as never,
  ]);
  assert.equal(lifestyleOnly.novinky.some((article) => article.id === "snack-1"), false);
  assert.equal(lifestyleOnly.novinky[0]?.id, "who-keep");
  assert.deepEqual(
    prependUniqueArticles(
      [{ slug: "who-keep", id: "who-keep" } as never],
      [{ slug: "snack-1", id: "snack-1" } as never, { slug: "who-keep", id: "dup" } as never]
    ).map((article) => article.id),
    ["who-keep", "snack-1"]
  );
  const shortNews = {
    id: "who-short",
    title: "WHO: nová doporučení k očkování seniorů v Evropě",
    slug: "who-short-brief",
    excerpt: "Aktuální guideline.",
    content: Array.from({ length: 120 }, () => "slovo").join(" "),
    published: true,
    published_at: "2026-09-04T08:00:00.000Z",
    vip_only: false,
    locale: "cs",
    audience: "public",
    rubric_slug: "aktualni-zpravy",
  } as never;
  assert.equal(isListableNewsArticle(shortNews, new Date(), "cs"), false);
  assert.equal(isHomepageDeskArticle(shortNews, new Date(), "cs"), true);
  assert.equal(splitNewsDesks([shortNews]).novinky[0]?.id, "who-short");
  const publicNewsFill = splitNewsDesks([
    {
      id: "headache-fill",
      title: "Bolesti hlavy — kdy je běžná a kdy urgentní — červené a zelené signály",
      slug: "bolesti-hlavy-fill",
      excerpt: "Kdy volat lékaře.",
      content: longBody,
      published: true,
      published_at: "2026-09-04T11:00:00.000Z",
      vip_only: false,
      locale: "cs",
      audience: "public",
      public_topic: "nemoci",
    } as never,
  ]);
  assert.equal(publicNewsFill.novinky[0]?.id, "headache-fill");
  assert.equal(publicNewsFill.dlouhovekost.length, 0);
  assert.deepEqual(
    filterArticlesForLocale(
      [
        { id: "en-native", title: "Metabolic health and walking", locale: "en-US", public_topic: "zivotni-styl" },
        { id: "cz-only", title: "Úhrada u VZP a SÚKL v Česku", locale: "cs", excerpt: "pro české pacienty" },
      ],
      "en-US"
    ).map((a) => a.id),
    ["en-native"]
  );
  assert.equal(
    isListableNewsArticle(
      {
        id: "en-listable",
        title: "Evidence-based biohacking and sleep",
        slug: "verejnost-dlouhovekost-2026-09-01-biohack-sleep",
        excerpt: "Wearables without the hype.",
        content: longBody,
        published: true,
        published_at: "2026-09-01T10:00:00.000Z",
        vip_only: false,
        locale: "en-US",
        audience: "public",
        public_topic: "dlouhovekost",
      } as never,
      new Date(),
      "en-US"
    ),
    true
  );
  assert.ok(formatSyndicatedByline("en-US", "cs").includes("Czech desk"));
  assert.equal(isProfessionalAktualityTitle("Kosti ve středním věku: pohyb a vitamin D"), true);
  assert.equal(isProfessionalAktualityTitle("Zdravotní zpráva — Zahraniční zdravotnická zpráva"), false);
  assert.equal(isProfessionalAktualityTitle("Epidemiologická zpráva — USA"), false);
  const merged = mergeAktualityListing(
    [
      { id: "who-1", title: "WHO: nová doporučení k očkování seniorů", published_at: "2026-09-01T12:00:00.000Z" },
      { id: "stub-1", title: "Zdravotní zpráva — Zahraniční zdravotnická zpráva", published_at: "2026-09-01T13:00:00.000Z" },
    ],
    [
      { id: "long-1", title: "Kognitivní rezerva: pohyb, lidé a učení", published_at: "2026-08-01T12:00:00.000Z" },
      { id: "who-1", title: "WHO: nová doporučení k očkování seniorů", published_at: "2026-09-01T12:00:00.000Z" },
    ],
    8
  );
  assert.equal(merged[0]?.id, "long-1");
  assert.equal(merged.filter((item) => item.id === "who-1").length, 1);
  assert.equal(merged.some((item) => item.id === "stub-1"), false);
  assert.equal(
    isLongevityForeignSource({
      name: "Nature Aging",
      url: "https://www.nature.com/nataging.rss",
      categorySlug: "internal-medicine",
      rubric: "ai-study-summary",
      minAccessLevel: "public",
      contentPillar: "dlouhovekost",
    }),
    true
  );
  assert.equal(
    isLongevityForeignSource({
      name: "WHO News",
      url: "https://www.who.int/rss-feeds/news-english.xml",
      categorySlug: "general-practice",
      rubric: "ai-guideline-summary",
      minAccessLevel: "public",
    }),
    false
  );
  const ranked = rankV26ForeignSources(
    [
      {
        name: "WHO News",
        url: "https://www.who.int/rss-feeds/news-english.xml",
        categorySlug: "general-practice",
        rubric: "ai-guideline-summary",
        minAccessLevel: "public",
      },
      {
        name: "NIH National Institute on Aging",
        url: "https://www.nia.nih.gov/newsroom/rss.xml",
        categorySlug: "internal-medicine",
        rubric: "ai-study-summary",
        minAccessLevel: "public",
        contentPillar: "dlouhovekost",
      },
    ],
    true
  );
  assert.equal(ranked[0]?.name, "NIH National Institute on Aging");
  console.log("✓ longevity desk classification keeps topic articles on the homepage");
}

assert.equal(WRITER_DESKS.length, 5, "five magazine category desks");
assert.equal(WRITERS_PER_CATEGORY, 4, "four senior specialists per category");
assert.equal(WRITER_SPECIALISTS.length, 20, "20 deployed public writers");
assert.equal(WRITER_AGENTS.length, 20, "WRITER_AGENTS is the specialist roster");
assert.equal(PUBLIC_WRITERS_PER_CATEGORY, 4);
assert.equal(PUBLIC_WRITER_COUNT, 20);
assert.equal(DAILY_PUBLIC_ARTICLE_TARGET, DEFAULT_PUBLIC_WRITER_LIMIT * 20);
{
  const morning = publicWriterSliceForHour(6, 20);
  const evening = publicWriterSliceForHour(20, 20);
  assert.ok(morning.limit >= 2 && morning.limit <= 4);
  assert.notEqual(evening.offset, morning.offset);
  assert.equal(evening.offset + evening.limit, 20);
}
assert.equal(
  resolveWriterAgent({ metadata: { writer_id: "writer3-trends" } })?.topic,
  "prevence"
);
{
  const specialist = resolveWriterAgent({ metadata: { writer_id: "writer1-trends" } });
  assert.ok(specialist);
  assert.equal(specialist.deskId, "writer1");
  assert.equal(getSurfaceCopy("cs").writers[specialist.deskId].topicLabel, "Životní styl");
}
assert.equal(
  resolveWriterAgent({ metadata: { writer_id: "writer1" } })?.deskId,
  "writer1"
);
assert.ok(GLOBAL_LOCALES.some((item) => item.code === "pt"));
assert.ok(GLOBAL_LOCALES.some((item) => item.code === "pt-BR"));
assert.equal(localeFromCountry("PT"), "pt");
assert.equal(localeFromCountry("BR"), "pt-BR");
assert.equal(allLocaleMagazineDesks().length, GLOBAL_LOCALES.length);
assert.equal(MAGAZINE_WRITERS_PER_LOCALE, 20);
assert.equal(MAGAZINE_EDITORS_PER_LOCALE, 6);
assert.equal(totalDeployedMagazineWriters(), GLOBAL_LOCALES.length * 20);
assert.equal(totalDeployedMagazineEditors(), GLOBAL_LOCALES.length * 6);
assert.ok(getReviewPipeline("pt").length >= 6);
assert.ok(getReviewPipeline("pt-BR").length >= 6);
assert.ok(getReviewPipeline("de").length >= 6);
assert.ok(foreignDeskMayComment("cs", "de"));
assert.ok(buildDeskComment({ fromLocale: "de", onLocale: "cs", kind: "borrow" }));
assert.ok(!looksLikeCzech(getNewsletterCopy("pt").body));
assert.ok(!looksLikeCzech(getNewsletterCopy("pt-BR").title));
assert.ok(getNewsletterCopy("pt-BR").welcomeIntro.includes("Você"));
assert.ok(!looksLikeCzech(getHomepageLongevityCopy("pt").title));
assert.ok(!looksLikeCzech(getHomepageLongevityCopy("pt-BR").lead));
assert.ok(getHomepageLongevityCopy("pt-BR").steps[1]!.title.includes("você"));
assert.ok(!looksLikeCzech(getMagazineCopy("pt").claim));
assert.ok(getMagazineCopy("pt").claim.toLowerCase().includes("longevidade"));
assert.ok(getMagazineCopy("pt-BR").claim.toLowerCase().includes("longevidade"));
assert.equal(getSurfaceCopy("pt").writers.writer1.topicLabel, "Estilo de vida");
assert.equal(getSurfaceCopy("pt-BR").writers.writer5.topicLabel, "Longevidade");
assert.ok(!looksLikeCzech(getSurfaceCopy("pt").writersTitle));
assert.equal(translateNavHref("/verejnost/clanky", "pt", { label: "Články" }).label, "Artigos da redação");
assert.ok(FOREIGN_WRITER_ROTATION.includes("pt"));
assert.ok(FOREIGN_WRITER_ROTATION.includes("pt-BR"));
{
  const locales = defaultPublicWriterLocales(new Date("2026-09-03T00:00:00Z"));
  assert.deepEqual(locales[0], "cs");
  assert.equal(locales.length, 2);
  assert.equal(locales[1], rotatingForeignWriterLocale(new Date("2026-09-03T00:00:00Z")));
  assert.notEqual(locales[1], "cs");
  const plan = describeDailyWriterPlan(new Date("2026-09-03T00:00:00Z"));
  assert.ok(plan.locales.includes("cs"));
  assert.equal(plan.rotatingLocale, locales[1]);
  assert.ok(plan.expectedArticles < MAGAZINE_WRITERS_PER_LOCALE * GLOBAL_LOCALES.length * 4);
}
assert.equal(EDITORIAL_PERSONAS.filter((p) => p.active).length, 29);
assert.equal(EDITORIAL_PERSONAS.filter((p) => p.role === "editor").length, 8);
assert.ok(getReviewPipeline("cs").length >= 6, "multiple MedScopeGlobal editors on CS bench");
{
  const reviewed = reviewPublicArticle({
    title: "Spánek v zimě",
    excerpt: "Praktický přehled.",
    bodyHtml: "<p>Staňte se VIP ještě dnes.</p><p>Užitečné tipy na režim.</p>",
  });
  assert.equal(reviewed.editors.length >= 4, true, "multi-editor bench");
  assert.ok(!/staňte se\s+vip/i.test(reviewed.bodyHtml), "hard-sell VIP stripped");
  assert.ok(/155/.test(reviewed.bodyHtml), "medical disclaimer present");
}
console.log(
  `✓ public writers=${WRITER_AGENTS.length} desks=${WRITER_DESKS.length} editors=${getReviewPipeline("cs").length}`
);

{
  const notesSql = readFileSync(
    join(root, "supabase/migrations/20260808000000_dokumentace_notes.sql"),
    "utf8"
  );
  const hardenSql = readFileSync(
    join(root, "supabase/migrations/20260904000000_dokumentace_notes_rls_harden.sql"),
    "utf8"
  );
  const notesSrc = readFileSync(join(root, "lib/lekari/dokumentace/notes.ts"), "utf8");
  const notesRoute = readFileSync(
    join(root, "app/api/lekari/dokumentace/notes/route.ts"),
    "utf8"
  );
  const processRoute = readFileSync(
    join(root, "app/api/lekari/dokumentace/process/route.ts"),
    "utf8"
  );
  const structureRoute = readFileSync(
    join(root, "app/api/lekari/dokumentace/structure/route.ts"),
    "utf8"
  );
  for (const [label, sql] of [
    ["create", notesSql],
    ["harden", hardenSql],
  ] as const) {
    assert.ok(
      sql.includes("enable row level security"),
      `${label} migration must enable RLS on dokumentace_notes`
    );
    assert.ok(
      sql.includes("force row level security"),
      `${label} migration must FORCE RLS so table owners cannot dump transcripts`
    );
    assert.ok(
      sql.includes("auth.uid() = user_id"),
      `${label} migration must isolate rows to auth.uid()`
    );
    assert.ok(
      /for select[\s\S]*using \(auth\.uid\(\) = user_id\)/.test(sql),
      `${label} must have SELECT policy auth.uid() = user_id`
    );
    assert.ok(
      /for insert[\s\S]*with check \(auth\.uid\(\) = user_id\)/.test(sql),
      `${label} must have INSERT WITH CHECK auth.uid() = user_id`
    );
    assert.ok(
      /for update[\s\S]*using \(auth\.uid\(\) = user_id\)[\s\S]*with check \(auth\.uid\(\) = user_id\)/.test(
        sql
      ),
      `${label} must block user_id reassignment on UPDATE`
    );
    assert.ok(
      /for delete[\s\S]*using \(auth\.uid\(\) = user_id\)/.test(sql),
      `${label} must have DELETE policy auth.uid() = user_id`
    );
    assert.ok(
      /revoke all on table public\.dokumentace_notes from anon/i.test(sql),
      `${label} must revoke anon on transcript table`
    );
    assert.ok(
      /to authenticated/.test(sql),
      `${label} policies must be granted only to authenticated`
    );
  }
  assert.ok(
    notesSrc.includes("createDokumentaceUserClient"),
    "OrdiZapis notes must use a user-JWT client so RLS is enforced"
  );
  assert.ok(
    notesSrc.includes("assertSamePhysician"),
    "notes helpers must refuse a session / userId mismatch"
  );
  assert.ok(
    notesSrc.includes('.eq("user_id", userId)'),
    "notes queries must also filter user_id in application code"
  );
  assert.ok(
    !notesSrc.includes("createServiceRoleClient();\n  const { data, error } = await admin\n    .from(\"dokumentace_notes\")"),
    "primary dokumentace_notes path must not use service role"
  );
  for (const [label, src] of [
    ["notes POST", notesRoute],
    ["process", processRoute],
    ["structure", structureRoute],
  ] as const) {
    assert.ok(
      !src.includes("createServiceRoleClient"),
      `${label} must not save transcripts with the service-role client`
    );
    assert.ok(
      src.includes("saveDokumentaceNote({"),
      `${label} must save via the user-scoped helper`
    );
  }
}

console.log("✓ editorial image pipeline checks passed");
console.log(
  `  MeDipacient demo: ${dash.stats.reports} zpráv, ${dash.stats.diagnoses} dg, ${dash.stats.meds} léků`
);
console.log(`  MeDiprep bank: ${stats.total} otázek · ${prep.faculties.length} fakult`);
