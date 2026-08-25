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
import { getAffiliateRedirectDestination } from "../../lib/ecosystem/monetization";

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

console.log("✓ app functional checks passed");
console.log(
  `  MeDipacient demo: ${dash.stats.reports} zpráv, ${dash.stats.diagnoses} dg, ${dash.stats.meds} léků`
);
console.log(`  MeDiprep bank: ${stats.total} otázek · ${prep.faculties.length} fakult`);
