#!/usr/bin/env node
/**
 * Local functional checks for MeDipacient, MeDiprep, and the app catalog.
 * Run via: pnpm exec tsx scripts/apps/functional-check.ts
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
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
  AD_INVENTORY,
  getClientAdConfig,
} from "../../lib/ecosystem/monetization";
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
  isFoodCoverUrl,
  isClinicalOrBrainCoverUrl,
  isDeniedEditorialImageUrl,
  isBrainScanCoverUrl,
  articleNeedsCoverRemediation,
} from "../../lib/ecosystem/editorial/images";
import { getImageCuratorForLocale } from "../../lib/ecosystem/editorial/personas";
import { polishCzechFields } from "../../lib/v22/translate";
import {
  classifyNewsDesk,
  isLongevityArticle,
  isProfessionalAktualityTitle,
  mergeAktualityListing,
  splitNewsDesks,
} from "../../lib/v271/news-desks";
import {
  isLongevityForeignSource,
  rankV26ForeignSources,
} from "../../lib/v26/foreign-news-ingest";
import { hubTopicListingHref } from "../../lib/config/verejnost-topics";
import { formatEditorialUnitDisplay, publicEditorialByline } from "../../lib/editorial/units";
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
import { SYNDICATION_RULES, getSyndicationTargets } from "../../lib/ecosystem/editorial/syndication";
import { APP_MARKETING_IMAGE, MARKETING_VISUALS } from "../../lib/brand/marketing-visuals";
import {
  MAGAZINE_LISTING_MIN_WORDS,
  shouldHideFromPublicListing,
  filterMagazineListableArticles,
} from "../../lib/editorial/article-quality-audit";
const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function file(rel: string) {
  assert.ok(existsSync(join(root, rel)), `missing ${rel}`);
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
file("public/assets/affiliate/magnesium.svg");
file("public/assets/affiliate/omega-test.svg");
file("public/assets/affiliate/sleep-tracker.svg");

assert.equal(getAffiliateRedirectDestination("mg-cz")?.includes("heureka"), true);
assert.equal(getAffiliateRedirectDestination("mg-us")?.includes("amazon.com"), true);
assert.equal(getAffiliateRedirectDestination("unknown"), null);

assert.ok(AD_INVENTORY.some((e) => e.id === "article-below-title"));
assert.ok(AD_INVENTORY.some((e) => e.surface === "homepage"));
assert.ok(AD_INVENTORY.some((e) => e.surface === "app-landing"));
const adCfg = getClientAdConfig();
assert.equal(typeof adCfg.enabled, "boolean");
assert.equal(adCfg.enabled, false); // no keys in CI / default env

file("app/api/ecosystem/editorial/images/route.ts");
file("lib/ecosystem/editorial/images/policy.ts");
file("lib/ecosystem/editorial/images/matcher.ts");
file("scripts/editorial/backfill-article-images.mjs");
file("app/api/cron/ecosystem-generate-articles/route.ts");
file("app/api/cron/ecosystem-syndicate/route.ts");
file("lib/ecosystem/editorial/desks.ts");
file("lib/ecosystem/editorial/syndication.ts");

assert.equal(EDITORIAL_DESKS.length, 19, "desk per global locale");
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
  assert.equal(unique[0]?.metadata?.editorial_image_review, "ai_editor");
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
  assert.equal(toppedUp.novinky.length, 1);
  assert.equal(toppedUp.novinky[0]?.id, "only-osteo");
  assert.equal(toppedUp.dlouhovekost[0]?.id, "only-osteo");
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

console.log("✓ editorial image pipeline checks passed");
console.log(
  `  MeDipacient demo: ${dash.stats.reports} zpráv, ${dash.stats.diagnoses} dg, ${dash.stats.meds} léků`
);
console.log(`  MeDiprep bank: ${stats.total} otázek · ${prep.faculties.length} fakult`);
