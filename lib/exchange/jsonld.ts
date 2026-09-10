import { SITE } from "@/lib/config/site";
import type { ExchangeListing, ExchangeOrganization } from "@/lib/exchange/types";
import { regionLabel } from "@/lib/exchange/regions";

export function exchangeOrganizationJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MedScope B2B Exchange",
    parentOrganization: { "@type": "Organization", name: SITE.name, url: SITE.url },
    url: `${SITE.url}/${locale.split("-")[0]}/exchange`,
    description:
      "B2B healthcare marketplace for companies, clinics, hospitals, laboratories and universities. Direct contact only — MedScopeGlobal does not process payments, contracts or delivery.",
    areaServed: ["EU", "USA", "Asia", "Global"],
    audience: { "@type": "Audience", audienceType: "Business" },
  };
}

export function listingJsonLd(listing: ExchangeListing, locale: string) {
  const url = `${SITE.url}/${locale.split("-")[0]}/exchange/listing/${listing.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": listing.kind === "service" ? "Service" : listing.kind === "demand" ? "Demand" : "Product",
    name: listing.title,
    description: listing.summary,
    url,
    category: listing.category,
    inLanguage: listing.sourceLocale,
    areaServed: listing.availabilityRegions.map((region) => regionLabel(region, "en")),
    brand: listing.organization
      ? { "@type": "Organization", name: listing.organization.tradeName }
      : undefined,
    additionalProperty: listing.certifications.map((code) => ({
      "@type": "PropertyValue",
      name: "certification",
      value: code,
    })),
  };
}

export function companyJsonLd(org: ExchangeOrganization, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.tradeName,
    legalName: org.legalName,
    url: `${SITE.url}/${locale.split("-")[0]}/exchange/companies/${org.slug}`,
    email: org.contactEmail,
    telephone: org.contactPhone ?? undefined,
    address: { "@type": "PostalAddress", addressCountry: org.countryCode },
    areaServed: org.availabilityRegions,
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
