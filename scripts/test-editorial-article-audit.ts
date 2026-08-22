#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  auditArticle,
  buildSafeEditorialAppend,
  buildVerifiedSourceSection,
  clampFuturePublishedAt,
  extractExistingDoi,
  claimsExternalSource,
  isOriginalMedScopeEditorial,
  passesIngestionQualityGate,
  shouldHideFromPublicListing,
  shouldQuarantineFromPublication,
  summarizeArticleAudits,
  type AuditableArticle,
} from "../lib/editorial/article-quality-audit";

const NOW = new Date("2026-08-16T00:00:00.000Z");

const stub: AuditableArticle = {
  id: "stub",
  slug: "automaticky-stub",
  title: "Automatické shrnutí",
  excerpt: "Krátký perex.",
  content:
    "<h2>Shrnutí</h2><p>Automatické shrnutí z mezinárodního lékařského zdroje.</p>",
  published_at: "2026-08-20T00:00:00.000Z",
  source_url: "not-a-url",
  source_name: "MedScopeGlobal",
  min_access_level: "physician",
  locale: "cs",
  metadata: {},
  ai_generated: true,
};

const stubAudit = auditArticle(stub, NOW);
assert.equal(stubAudit.severe, true);
assert.ok(stubAudit.issues.some((issue) => issue.code === "stub_content"));
assert.ok(stubAudit.issues.some((issue) => issue.code === "boilerplate_or_fallback"));
assert.ok(stubAudit.issues.some((issue) => issue.code === "future_publication_date"));
assert.ok(stubAudit.issues.some((issue) => issue.code === "missing_limitations"));

const sourceRepair: AuditableArticle = {
  id: "repair",
  slug: "repair",
  title: "Český odborný přehled",
  excerpt: "Konkrétní český perex.",
  content: `<h2>Kontext</h2><p>${"Doložený český obsah. ".repeat(400)}</p>
    <h2>Klinický význam</h2><p>Dopad je potřeba posoudit individuálně.</p>
    <h2>Limity a nejistoty</h2><p>Podklad neumožňuje kauzální závěr.</p>
    <h2>Primární evidence</h2><p>Design studie je popsán ve zdroji.</p>
    <h2>Zdroje</h2><ul><li>Ověřený časopis a odkaz.</li></ul>`,
  published_at: "2026-08-15T00:00:00.000Z",
  source_url: "https://example.org/article",
  source_name: "The Lancet Rheumatology",
  min_access_level: "physician",
  locale: "cs",
  metadata: {},
};

const repairAudit = auditArticle(sourceRepair, NOW);
assert.deepEqual(repairAudit.safeMetadataPatch, {
  source_citation: {
    name: "The Lancet Rheumatology",
    url: "https://example.org/article",
  },
});

const repairedAudit = auditArticle(
  {
    ...sourceRepair,
    metadata: {
      source_citation: {
        name: "The Lancet Rheumatology",
        url: "https://example.org/article",
      },
    },
  },
  NOW
);
assert.equal(repairedAudit.safeMetadataPatch, null);
assert.equal(repairedAudit.severe, false);
assert.ok(!repairedAudit.issues.some((issue) => issue.code === "missing_source_metadata"));

const summary = summarizeArticleAudits([stubAudit, repairedAudit]);
assert.equal(summary.audited, 2);
assert.equal(summary.severe, 1);
assert.equal(summary.physician, 2);
assert.equal(shouldHideFromPublicListing(stub, NOW), true);
assert.equal(shouldQuarantineFromPublication(stub, NOW), true);
const englishTitle: AuditableArticle = {
  ...sourceRepair,
  id: "en-title",
  slug: "english-title",
  title: "The clinical trial study with patients and treatment outcomes",
  excerpt: "The study and trial results for patients and treatment.",
};
assert.equal(shouldHideFromPublicListing(sourceRepair, NOW), false);
assert.equal(shouldQuarantineFromPublication(sourceRepair, NOW), false);
assert.equal(shouldHideFromPublicListing(englishTitle, NOW), true);
assert.equal(shouldQuarantineFromPublication(englishTitle, NOW), true);
assert.equal(clampFuturePublishedAt(stub, NOW), "2026-08-16T00:00:00.000Z");
assert.equal(clampFuturePublishedAt(sourceRepair, NOW), null);
assert.ok(
  buildVerifiedSourceSection(sourceRepair)?.includes("https://example.org/article")
);
assert.equal(shouldQuarantineFromPublication({
  ...sourceRepair,
  content: `${sourceRepair.content}<p>Automatické shrnutí z mezinárodního lékařského zdroje.</p>`,
}, NOW), true);
const physicianThin: AuditableArticle = {
  ...sourceRepair,
  content: `<h2>Kontext</h2><p>${"Doložený český obsah. ".repeat(80)}</p>`,
  source_url: null,
  source_name: null,
  metadata: {},
};
const physicianAppend = buildSafeEditorialAppend(physicianThin, NOW);
assert.ok(physicianAppend?.includes("Limity a nejistoty"));
assert.ok(physicianAppend?.includes("Primární evidence a redakční interpretace"));
assert.ok(physicianAppend?.includes("Dopad do klinické praxe"));
assert.ok(physicianAppend?.includes("desk MedScopeGlobal"));
assert.equal(
  extractExistingDoi({
    ...sourceRepair,
    source_url: "https://doi.org/10.1016/S0140-6736(24)00001-2",
  }),
  "10.1016/S0140-6736(24)00001-2"
);
const afterAppend = auditArticle(
  { ...physicianThin, content: `${physicianThin.content}\n${physicianAppend}` },
  NOW
);
assert.ok(!afterAppend.issues.some((issue) => issue.code === "missing_limitations"));
assert.ok(!afterAppend.issues.some((issue) => issue.code === "unclear_evidence_boundary"));
assert.ok(!afterAppend.issues.some((issue) => issue.code === "missing_source_section"));
assert.ok(!afterAppend.issues.some((issue) => issue.code === "missing_clinical_relevance"));
assert.ok(!afterAppend.issues.some((issue) => issue.code === "unverifiable_doi_text"));

const originalDesk: AuditableArticle = {
  ...physicianThin,
  title: "Anatomie srdce pro studenty",
  slug: "anatomie-srdce-prevodni-system-pro-studenty",
  source_name: "Redakce MedScopeGlobal",
  content: `${physicianThin.content}\n${physicianAppend}`,
};
assert.equal(isOriginalMedScopeEditorial(originalDesk), true);
assert.equal(claimsExternalSource(originalDesk), false);
const originalAudit = auditArticle(originalDesk, NOW);
assert.equal(originalAudit.severe, false);
assert.ok(
  !originalAudit.issues.some((issue) => issue.code === "missing_verifiable_source_url")
);
assert.deepEqual(originalAudit.safeMetadataPatch?.source_citation, {
  name: "Redakce MedScopeGlobal",
  type: "original_editorial",
});

const claimedStudy: AuditableArticle = {
  ...physicianThin,
  title: "Neuropathology v LMIC: Cesta vpřed",
  slug: "neuropathology-in-low-and-middle-income-countries-a-narrative-review-of-capacity-barriers-and-pathways-forward",
  source_name: null,
  content: `${physicianThin.content}<p>Randomized controlled trial results.</p>`,
};
assert.equal(claimsExternalSource(claimedStudy), true);
assert.equal(isOriginalMedScopeEditorial(claimedStudy), false);
const claimedAudit = auditArticle(claimedStudy, NOW);
assert.equal(claimedAudit.severe, true);
assert.ok(claimedAudit.issues.some((issue) => issue.code === "missing_verifiable_source_url"));

assert.equal(passesIngestionQualityGate(physicianThin, NOW).ready, false);
assert.equal(passesIngestionQualityGate(originalDesk, NOW).ready, false);
const thinAudit = auditArticle(physicianThin, NOW);
assert.ok(
  thinAudit.issues.some((issue) => issue.code === "thin_content" && issue.severity === "warning")
);
assert.ok(
  !thinAudit.issues.some((issue) => issue.code === "thin_content" && issue.severity === "critical")
);

const publicThin: AuditableArticle = {
  ...sourceRepair,
  min_access_level: "public",
  audience: "public",
  content: `<h2>Kontext</h2><p>${"Krátký český odstavec. ".repeat(40)}</p>
    <h2>Zdroje</h2><ul><li><a href="https://example.org/article">The Lancet Rheumatology</a></li></ul>`,
};
assert.ok(auditArticle(publicThin, NOW).issues.some((issue) => issue.code === "thin_content"));
assert.equal(passesIngestionQualityGate(publicThin, NOW).ready, false);

const heartHeadings: AuditableArticle = {
  ...sourceRepair,
  slug: "beyond-the-pump-integrating-the-hearts-endocrine-function-into-early-medical-education",
  title: "Srdce jako endokrinní orgán: natriuretické peptidy od fyziologie ke klinickému rozhodování",
  content: `<h2>Co má lékař po přečtení umět</h2><p>${"Klinický význam natriuretických peptidů. ".repeat(200)}</p>
    <h2>Co z původní publikace nelze tvrdit</h2>
    <p>Původní článek je narativní přehled a nedokazuje zlepšení klinických výsledků.</p>
    <h2>Zdroje a doporučená literatura</h2>
    <ul><li><a href="https://doi.org/10.1080/10872981.2026.2704285">Medical Education Online</a></li></ul>`,
  source_url: "https://doi.org/10.1080/10872981.2026.2704285",
  source_name: "Medical Education Online",
  metadata: {
    source_citation: {
      name: "Medical Education Online",
      url: "https://doi.org/10.1080/10872981.2026.2704285",
      doi: "10.1080/10872981.2026.2704285",
    },
  },
};
const heartAudit = auditArticle(heartHeadings, NOW);
assert.equal(heartAudit.severe, false);
assert.ok(!heartAudit.issues.some((issue) => issue.code === "missing_limitations"));
assert.ok(!heartAudit.issues.some((issue) => issue.code === "unclear_evidence_boundary"));
assert.ok(!heartAudit.issues.some((issue) => issue.code === "thin_content"));
assert.equal(passesIngestionQualityGate(heartHeadings, NOW).ready, true);
assert.equal(shouldQuarantineFromPublication(heartHeadings, NOW), false);

console.log("Editorial article audit regression tests passed.");
