import Link from "next/link";
import { notFound } from "next/navigation";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ExchangeListingCard } from "@/components/exchange/listing-card";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { getExchangeOrganization } from "@/lib/exchange/catalog";
import { companyJsonLd } from "@/lib/exchange/jsonld";
import { entitlementsFor } from "@/lib/exchange/monetization";
import { DEMO_ORGANIZATIONS } from "@/lib/exchange/seed";
import { regionLabel } from "@/lib/exchange/regions";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { getExchangeSubCopy } from "@/lib/i18n/exchange-subscription-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  return DEMO_ORGANIZATIONS.filter((item) => item.plan === "enterprise" || item.micrositeEnabled).map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getServerLocale();
  const { slug } = await params;
  const { organization } = await getExchangeOrganization(slug);
  const sub = getExchangeSubCopy(locale);
  return buildLocalizedPageMetadata({
    title: organization ? `${organization.tradeName} | ${sub.micrositeTitle}` : sub.micrositeTitle,
    description: organization?.description ?? sub.micrositeLead,
    path: `/exchange/m/${slug}`,
    locale,
  });
}

export default async function ExchangeMicrositePage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  const sub = getExchangeSubCopy(locale);
  const { slug } = await params;
  const { organization, listings } = await getExchangeOrganization(slug);
  if (!organization) notFound();

  const access = entitlementsFor(organization.plan);
  const enabled = access.canUseMicrosite || Boolean(organization.micrositeEnabled);

  if (!enabled) {
    return (
      <ModulePageShell eyebrow={copy.eyebrow} title={sub.micrositeTitle} description={sub.micrositeLead}>
        <p className="text-sm text-slate-600">{sub.lockedBody}</p>
        <Link href={localizePublicHref("/exchange/pricing", locale)} className="mt-4 inline-block text-sm font-semibold text-[#005B96]">
          {sub.upgradeCta} →
        </Link>
      </ModulePageShell>
    );
  }

  return (
    <div className="min-h-[70vh] bg-[#021d33] text-white">
      <JsonLdScript data={companyJsonLd(organization, locale)} />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e8d5a3]">{sub.micrositeTitle}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">{organization.tradeName}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">{organization.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {organization.availabilityRegions.map((region) => (
            <span key={region} className="rounded-full border border-white/20 px-3 py-1 text-xs">
              {regionLabel(region, locale)}
            </span>
          ))}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {listings.map((listing) => (
            <ExchangeListingCard key={listing.id} listing={listing} locale={locale} copy={copy} dark />
          ))}
        </div>
      </div>
    </div>
  );
}
