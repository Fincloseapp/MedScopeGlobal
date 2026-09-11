import { notFound } from "next/navigation";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ExchangeListingCard } from "@/components/exchange/listing-card";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { getExchangeOrganization } from "@/lib/exchange/catalog";
import { companyJsonLd } from "@/lib/exchange/jsonld";
import { regionLabel } from "@/lib/exchange/regions";
import { DEMO_ORGANIZATIONS } from "@/lib/exchange/seed";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  return DEMO_ORGANIZATIONS.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getServerLocale();
  const { slug } = await params;
  const { organization } = await getExchangeOrganization(slug);
  const copy = getExchangeCopy(locale);
  return buildLocalizedPageMetadata({
    title: organization ? `${organization.tradeName} | ${copy.companyProfile}` : copy.metaTitle,
    description: organization?.description ?? copy.metaDescription,
    path: `/exchange/companies/${slug}`,
    locale,
  });
}

export default async function ExchangeCompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  const { slug } = await params;
  const { organization, listings } = await getExchangeOrganization(slug);
  if (!organization) notFound();

  return (
    <ModulePageShell eyebrow={copy.companyProfile} title={organization.tradeName} description={organization.description}>
      <JsonLdScript data={companyJsonLd(organization, locale)} />
      <p className="text-sm text-slate-600">
        {organization.legalName}
        {organization.verified ? ` · ${copy.verified}` : ""}
      </p>
      <p className="mt-2 text-sm text-slate-600">
        {copy.fieldIco}: {organization.registrationId}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {organization.availabilityRegions.map((region) => (
          <span key={region} className="rounded-full border border-[#cfe1f3] px-3 py-1 text-xs">
            {regionLabel(region, locale)}
          </span>
        ))}
      </div>
      {organization.website ? (
        <p className="mt-4 text-sm">
          <a className="text-[#005B96] underline" href={organization.website} rel="noopener noreferrer">
            {organization.website.replace(/^https?:\/\//, "")}
          </a>
        </p>
      ) : null}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {listings.map((listing) => (
          <ExchangeListingCard key={listing.id} listing={listing} locale={locale} copy={copy} />
        ))}
      </div>
    </ModulePageShell>
  );
}
