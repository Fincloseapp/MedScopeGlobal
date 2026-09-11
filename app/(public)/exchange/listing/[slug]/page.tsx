import Link from "next/link";
import { notFound } from "next/navigation";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ExchangeContactForm } from "@/components/exchange/contact-form";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { getExchangeListing } from "@/lib/exchange/catalog";
import { categoryLabel } from "@/lib/exchange/categories";
import { listingJsonLd } from "@/lib/exchange/jsonld";
import { regionLabel } from "@/lib/exchange/regions";
import { DEMO_LISTINGS } from "@/lib/exchange/seed";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 60;

export async function generateStaticParams() {
  return DEMO_LISTINGS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getServerLocale();
  const { slug } = await params;
  const { listing } = await getExchangeListing(slug);
  const copy = getExchangeCopy(locale);
  return buildLocalizedPageMetadata({
    title: listing ? `${listing.title} | ${copy.eyebrow}` : copy.catalogMetaTitle,
    description: listing?.summary ?? copy.catalogMetaDescription,
    path: `/exchange/listing/${slug}`,
    locale,
  });
}

export default async function ExchangeListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  const { slug } = await params;
  const { listing } = await getExchangeListing(slug);
  if (!listing) notFound();

  const orgHref = listing.organization
    ? localizePublicHref(`/exchange/companies/${listing.organization.slug}`, locale)
    : null;

  return (
    <ModulePageShell eyebrow={copy.eyebrow} title={listing.title} description={listing.summary}>
      <JsonLdScript data={listingJsonLd(listing, locale)} />
      <p className="text-sm text-slate-600">
        {listing.kind === "product" ? copy.kindProduct : listing.kind === "service" ? copy.kindService : copy.kindDemand}
        {" · "}
        {categoryLabel(listing.category, locale)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {listing.availabilityRegions.map((region) => (
          <span key={region} className="rounded-full border border-[#cfe1f3] px-3 py-1 text-xs font-semibold">
            {regionLabel(region, locale)}
          </span>
        ))}
        {listing.certifications.map((code) => (
          <span key={code} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
            {copy.certifications}: {code}
          </span>
        ))}
      </div>
      {listing.organization ? (
        <p className="mt-4 text-sm">
          {copy.companyProfile}:{" "}
          {orgHref ? (
            <Link href={orgHref} className="font-semibold text-[#005B96] hover:underline">
              {listing.organization.tradeName}
            </Link>
          ) : (
            listing.organization.tradeName
          )}
        </p>
      ) : null}
      {listing.priceHint ? (
        <p className="mt-2 text-sm text-slate-700">
          {copy.fieldPrice}: {listing.priceHint}
        </p>
      ) : null}
      <div className="prose prose-slate mt-6 max-w-none text-sm leading-7">
        <p>{listing.description}</p>
      </div>
      {listing.documentationUrl ? (
        <p className="mt-4 text-sm">
          <a href={listing.documentationUrl} className="text-[#005B96] underline">
            {copy.fieldDocs}
          </a>
        </p>
      ) : null}
      <p className="mt-6 text-sm font-medium text-slate-700">{copy.intermediary}</p>
      <div className="mt-8 max-w-xl">
        <ExchangeContactForm listingSlug={listing.slug} locale={locale} copy={copy} />
      </div>
    </ModulePageShell>
  );
}
