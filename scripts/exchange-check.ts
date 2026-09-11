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
import { entitlementsFor, EXCHANGE_COMMISSION, EXCHANGE_PLANS_SPEC, isPaidPlan } from "../lib/exchange/monetization";
import { canApproveListings, effectiveExchangeRole, EXCHANGE_ROLES } from "../lib/exchange/roles";
import { filterDemoListings, DEMO_LISTINGS, DEMO_ORGANIZATIONS } from "../lib/exchange/seed";
import { listDemoInquiries, redactInquiry, DEMO_INQUIRIES } from "../lib/exchange/inquiries";
import { publicOrganization } from "../lib/exchange/public-surface";
import { getExchangeCopy } from "../lib/i18n/exchange-copy";
import { getExchangeMarketing } from "../lib/i18n/exchange-marketing";
import { getExchangeSubCopy } from "../lib/i18n/exchange-subscription-copy";
import { getExchangeLegalDoc, listExchangeLegalDocs } from "../lib/exchange/legal-docs";
import { slugifyExchange } from "../lib/exchange/slug";
import { listingJsonLd, companyJsonLd } from "../lib/exchange/jsonld";
import { exchangeMailTemplate } from "../lib/exchange/emails";

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
assert.equal(EXCHANGE_COMMISSION.dealCommissionPercent, 0);
assert.equal(EXCHANGE_COMMISSION.successFeePercent, 0);
assert.equal(EXCHANGE_COMMISSION.successFeeOptIn, false);
assert.equal(EXCHANGE_COMMISSION.processesPayments, false);
assert.equal(EXCHANGE_COMMISSION.revenueModel, "subscription_only");
assert.equal(EXCHANGE_PLANS_SPEC.basic.paid, false);
assert.equal(EXCHANGE_PLANS_SPEC.basic.monthlyCzk, 0);
assert.equal(EXCHANGE_PLANS_SPEC.pro.paid, true);
assert.equal(EXCHANGE_PLANS_SPEC.enterprise.paid, true);
assert.equal(isPaidPlan("basic"), false);
assert.equal(isPaidPlan("pro"), true);
assert.equal(entitlementsFor("basic").canSeeContacts, false);
assert.equal(entitlementsFor("basic").canReply, false);
assert.equal(entitlementsFor("pro").canSeeContacts, true);
assert.equal(entitlementsFor("pro").canReply, true);
assert.equal(entitlementsFor("enterprise").canUseMicrosite, true);
assert.equal(entitlementsFor("enterprise").canImportApi, true);

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
assert.ok(DEMO_LISTINGS.every((item) => !item.organization || !("contactEmail" in item.organization)));

const basicInbox = listDemoInquiries("basic");
assert.ok(basicInbox.every((item) => item.redacted));
assert.ok(basicInbox.every((item) => item.buyerEmail === null && item.buyerPhone === null && item.buyerName === null));
const proInbox = listDemoInquiries("pro");
assert.ok(proInbox.some((item) => !item.redacted && item.buyerEmail?.includes("@")));
const premium = redactInquiry(DEMO_INQUIRIES.find((item) => item.premium)!, "pro");
assert.equal(premium.redacted, true);
const enterprisePremium = redactInquiry(DEMO_INQUIRIES.find((item) => item.premium)!, "enterprise");
assert.equal(enterprisePremium.redacted, false);

const publicOrg = publicOrganization(DEMO_ORGANIZATIONS[0]);
assert.equal(publicOrg.contactEmail, "");
assert.equal(publicOrg.contactPhone, null);

assert.equal(getExchangeCopy("cs").contactCta.includes("Kontaktovat"), true);
assert.equal(getExchangeCopy("en").commissionBody.includes("0%"), true);
assert.ok(!getExchangeCopy("en").commissionBody.includes("5–12"));
assert.ok(!getExchangeCopy("cs").commissionBody.includes("5–12"));
assert.ok(!getExchangeCopy("de").title.includes("marketplace firms will"));
assert.ok(getExchangeCopy("sk").catalogCta.length > 0);
assert.ok(getExchangeCopy("pl").kindDemand.length > 0);
assert.ok(getExchangeCopy("hu").filterRegion.length > 0);
assert.ok(getExchangeSubCopy("cs").lockedTitle.length > 0);
assert.ok(getExchangeSubCopy("en").planFeatures.basic.includes("No contacts") || getExchangeSubCopy("en").planFeatures.basic.some((item) => item.toLowerCase().includes("contact")));

const terms = getExchangeLegalDoc("terms", "en");
assert.ok(terms.sections.some((section) => section.body.join(" ").includes("does not process payments")));
assert.ok(terms.sections.some((section) => section.body.join(" ").includes("no success fee")));
assert.equal(listExchangeLegalDocs("cs").length, 5);
assert.ok(getExchangeLegalDoc("privacy", "cs").sections.some((section) => section.body.join(" ").includes("GDPR")));
assert.equal(terms.version, "2026-09-11");

assert.equal(slugifyExchange("CE-marked POC Analyzer!"), "ce-marked-poc-analyzer");
const jsonld = listingJsonLd(DEMO_LISTINGS[0], "en");
assert.equal(jsonld["@type"], "Product");
const orgLd = companyJsonLd(DEMO_ORGANIZATIONS[0], "en");
assert.equal("email" in orgLd, false);

const mail = exchangeMailTemplate("inquiry", "en");
assert.ok(mail.subject.toLowerCase().includes("inquiry"));

for (const file of [
  "supabase/migrations/20260910120000_b2b_exchange.sql",
  "supabase/migrations/20260911120000_b2b_exchange_subscriptions.sql",
  "prisma/schema.prisma",
  "app/(public)/exchange/page.tsx",
  "app/(public)/exchange/dashboard/page.tsx",
  "app/(public)/exchange/inquiries/page.tsx",
  "app/(public)/exchange/m/[slug]/page.tsx",
  "app/api/exchange/health/route.ts",
  "app/api/exchange/inquiries/route.ts",
  "app/api/exchange/inquiries/[id]/reply/route.ts",
  "app/api/exchange/ads/order/route.ts",
  "public/assets/marketing/exchange/hero.webp",
  "public/assets/marketing/exchange/manufacturers.webp",
  "public/assets/marketing/exchange/hospitals.webp",
  "public/assets/marketing/exchange/laboratories.webp",
  "public/assets/marketing/exchange/diagnostics.webp",
  "public/assets/marketing/exchange/telemedicine.webp",
  "components/exchange/portal-spotlight.tsx",
  "components/exchange/homepage-billboard.tsx",
  "components/exchange/marketplace-hero.tsx",
  "lib/brand/exchange-visuals.ts",
  "docs/exchange/DEPLOY.md",
  "docs/exchange/QA.md",
  "locales/exchange/cs.json",
  "locales/exchange/en.json",
]) {
  assert.equal(existsSync(join(root, file)), true, `missing ${file}`);
}

assert.ok(getExchangeMarketing("cs").ribbon.includes("B2B Tržiště"));
assert.equal(getExchangeMarketing("en").navCta, "B2B Market");
assert.equal(getExchangeMarketing("cs").audiences.length, 4);
assert.ok(readFileSync(join(root, "app/(public)/page.tsx"), "utf8").includes("ExchangeHomepageBillboard"));
assert.ok(
  readFileSync(join(root, "app/(public)/page.tsx"), "utf8").indexOf("<ExchangeHomepageBillboard") <
    readFileSync(join(root, "app/(public)/page.tsx"), "utf8").indexOf("<PortalHome")
);
assert.ok(readFileSync(join(root, "components/layout/site-header.tsx"), "utf8").includes("ExchangeHeaderRibbon"));
assert.ok(!readFileSync(join(root, "app/(public)/exchange/listing/[slug]/page.tsx"), "utf8").includes("mailto:"));

const sql = readFileSync(join(root, "supabase/migrations/20260910120000_b2b_exchange.sql"), "utf8");
assert.ok(sql.includes("availability_region"));
assert.ok(sql.includes("exchange_listings"));
assert.ok(sql.includes("exchange_contacts"));
const subSql = readFileSync(join(root, "supabase/migrations/20260911120000_b2b_exchange_subscriptions.sql"), "utf8");
assert.ok(subSql.includes("exchange_inquiry_replies"));
assert.ok(subSql.includes("subscription-only"));

console.log("✓ exchange-check passed");
