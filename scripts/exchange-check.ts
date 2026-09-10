#!/usr/bin/env node
/**
 * MedScope B2B Exchange — domain, validation, i18n and legal guards.
 * Run: pnpm exec tsx scripts/exchange-check.ts
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  listingMatchesRegions,
  normalizeAvailabilityRegions,
  parseAvailabilityRegions,
  regionFromCountry,
  requireAvailabilityRegions,
  AVAILABILITY_REGIONS,
} from "../lib/exchange/regions";
import { listingCreateSchema, organizationOnboardSchema, contactInquirySchema } from "../lib/exchange/validation";
import { EXCHANGE_COMMISSION, clampSuccessFeePercent } from "../lib/exchange/monetization";
import { canApproveListings, effectiveExchangeRole, EXCHANGE_ROLES } from "../lib/exchange/roles";
import { filterDemoListings, DEMO_LISTINGS } from "../lib/exchange/seed";
import { getExchangeCopy } from "../lib/i18n/exchange-copy";
import { getExchangeLegalDoc, listExchangeLegalDocs } from "../lib/exchange/legal-docs";
import { slugifyExchange } from "../lib/exchange/slug";
import { listingJsonLd } from "../lib/exchange/jsonld";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

assert.deepEqual([...AVAILABILITY_REGIONS], ["EU", "USA", "Asia", "Global"]);
assert.equal(regionFromCountry("CZ"), "EU");
assert.equal(regionFromCountry("US"), "USA");
assert.equal(regionFromCountry("SG"), "Asia");
assert.equal(regionFromCountry("BR"), null);

assert.deepEqual(normalizeAvailabilityRegions(["EU", "Global", "Asia"]), ["Global"]);
assert.throws(() => requireAvailabilityRegions([]), /availability_region_required/);
assert.deepEqual(parseAvailabilityRegions(["EU", "Asia", "Mars"]), ["EU", "Asia"]);

assert.equal(listingMatchesRegions(["EU"], ["EU", "Asia"]), true);
assert.equal(listingMatchesRegions(["EU"], ["Asia"]), false);
assert.equal(listingMatchesRegions(["Global"], ["USA"]), true);
assert.equal(listingMatchesRegions(["USA"], ["Global"]), true);
assert.equal(listingMatchesRegions(["EU", "Asia"], ["EU", "Asia"]), true);

assert.equal(EXCHANGE_COMMISSION.contactFeePercent, 0);
assert.equal(EXCHANGE_COMMISSION.processesPayments, false);
assert.equal(clampSuccessFeePercent(20), 12);
assert.equal(clampSuccessFeePercent(1), 5);

assert.deepEqual([...EXCHANGE_ROLES], [
  "Owner",
  "Admin",
  "CompanyAdmin",
  "InstitutionAdmin",
  "StandardUser",
  "Guest",
]);
assert.equal(effectiveExchangeRole({ authenticated: false }), "Guest");
assert.equal(effectiveExchangeRole({ authenticated: true, platformRole: "admin" }), "Admin");
assert.equal(canApproveListings("Admin"), true);
assert.equal(canApproveListings("CompanyAdmin"), false);

const productOk = listingCreateSchema.safeParse({
  kind: "product",
  category: "diagnostics",
  title: "CE analyzer",
  summary: "Hospital-grade immunoassay platform for B2B supply only.",
  description: "CE-marked device with ISO 13485 QMS. Direct contract with manufacturer.",
  availabilityRegion: "EU",
  availabilityRegions: ["EU"],
  certifications: ["CE", "ISO"],
  sourceLocale: "en",
});
assert.equal(productOk.success, true);

const missingRegion = listingCreateSchema.safeParse({
  kind: "service",
  category: "consulting",
  title: "Regulatory consulting",
  summary: "MDR gap analysis for manufacturers entering the EU market.",
  description: "Structured gap analysis against EU MDR for B2B manufacturers only.",
  availabilityRegion: "Mars",
  sourceLocale: "en",
  certificationNotApplicable: true,
  certificationNotes: "Advisory service, no device placed on the market.",
});
assert.equal(missingRegion.success, false);

const publicDrug = listingCreateSchema.safeParse({
  kind: "product",
  category: "diagnostics",
  title: "Pain tablets",
  summary: "Over the counter pain tablets for consumers in pharmacies.",
  description: "Retail pain tablets sold to the public without prescription.",
  availabilityRegion: "EU",
  certifications: ["CE"],
  sourceLocale: "en",
  isPrescriptionMedicine: true,
});
assert.equal(publicDrug.success, false);

const onboard = organizationOnboardSchema.safeParse({
  legalName: "Nordic Diagnostics GmbH",
  kind: "company",
  registrationId: "HRB 184920",
  countryCode: "DE",
  contactEmail: "partners@example.com",
  contactPerson: "Dr. Lena Hartmann",
  availabilityRegions: ["EU"],
  sourceLocale: "de",
  description: "IVD manufacturer supplying hospital laboratories in the European Union.",
  acceptTerms: true,
  acceptPrivacy: true,
  acceptB2bOnly: true,
  acceptNoPublicDrugs: true,
  acceptNoPhi: true,
});
assert.equal(onboard.success, true);

const contact = contactInquirySchema.safeParse({
  listingSlug: "ce-poc-immunoassay-analyzer",
  buyerOrganization: "FN Morava",
  buyerName: "Ing. Petra Nováková",
  buyerEmail: "procurement@example.com",
  message: "Please send the CE technical file index and EU service coverage map.",
  acceptTerms: true,
  acceptNoPhi: true,
});
assert.equal(contact.success, true);

const asiaOnly = filterDemoListings({ regions: ["Asia"] });
assert.ok(asiaOnly.every((item) => item.availabilityRegions.includes("Asia") || item.availabilityRegions.includes("Global")));
assert.ok(DEMO_LISTINGS.some((item) => item.availabilityRegion === "EU"));
assert.ok(DEMO_LISTINGS.every((item) => item.availabilityRegions.length >= 1));

assert.equal(getExchangeCopy("cs").contactCta.includes("Kontaktovat"), true);
assert.equal(getExchangeCopy("en").commissionBody.includes("0%"), true);
assert.ok(!getExchangeCopy("de").title.includes("marketplace firms will"));
assert.ok(getExchangeCopy("sk").catalogCta.length > 0);
assert.ok(getExchangeCopy("pl").kindDemand.length > 0);
assert.ok(getExchangeCopy("hu").filterRegion.length > 0);

const terms = getExchangeLegalDoc("terms", "en");
assert.ok(terms.sections.some((section) => section.body.join(" ").includes("does not process payments")));
assert.equal(listExchangeLegalDocs("cs").length, 5);
assert.ok(getExchangeLegalDoc("privacy", "cs").sections.some((section) => section.body.join(" ").includes("GDPR")));

assert.equal(slugifyExchange("CE-marked POC Analyzer!"), "ce-marked-poc-analyzer");
const jsonld = listingJsonLd(DEMO_LISTINGS[0], "en");
assert.equal(jsonld["@type"], "Product");

for (const file of [
  "supabase/migrations/20260910120000_b2b_exchange.sql",
  "prisma/schema.prisma",
  "app/(public)/exchange/page.tsx",
  "app/api/exchange/health/route.ts",
]) {
  assert.equal(existsSync(join(root, file)), true, `missing ${file}`);
}

const sql = readFileSync(join(root, "supabase/migrations/20260910120000_b2b_exchange.sql"), "utf8");
assert.ok(sql.includes("availability_region"));
assert.ok(sql.includes("exchange_listings"));
assert.ok(sql.includes("exchange_contacts"));

console.log("✓ exchange-check passed");
