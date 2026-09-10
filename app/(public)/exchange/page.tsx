import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ExchangeListingCard } from "@/components/exchange/listing-card";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { listExchangeListings } from "@/lib/exchange/catalog";
import { exchangeOrganizationJsonLd, faqJsonLd } from "@/lib/exchange/jsonld";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 60;

export async function generateMetadata() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  return buildLocalizedPageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: "/exchange",
    locale,
  });
}

export default async function ExchangeLandingPage() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  const { items, source } = await listExchangeListings({ limit: 4 });
  const catalog = localizePublicHref("/exchange/catalog", locale);
  const onboard = localizePublicHref("/exchange/onboard", locale);
  const pricing = localizePublicHref("/exchange/pricing", locale);

  return (
    <ModulePageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.lead}
      ctaHref={catalog}
      ctaLabel={copy.catalogCta}
    >
      <JsonLdScript data={exchangeOrganizationJsonLd(locale)} />
      <JsonLdScript
        data={faqJsonLd(copy.barriers.map((item) => ({ q: item.fear, a: item.flip })))}
      />

      <div className="mb-8 flex flex-wrap gap-3">
        <Link href={onboard} className="rounded-full border border-[#005B96] px-5 py-2 text-sm font-semibold text-[#005B96]">
          {copy.onboardCta}
        </Link>
        <Link href={pricing} className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700">
          {copy.pricingCta}
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {copy.promises.map((item) => (
          <div key={item.title} className="rounded-2xl border border-[#cfe1f3] bg-white p-5">
            <h2 className="font-display text-lg font-semibold text-[#021d33]">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">{copy.barriersTitle}</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {copy.barriers.map((item) => (
            <li key={item.fear} className="rounded-2xl border border-[#cfe1f3] bg-[#f7fbff] p-4">
              <p className="text-sm font-semibold text-slate-800">{item.fear}</p>
              <p className="mt-1 text-sm text-[#005B96]">{item.flip}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">{copy.howTitle}</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-5">
          {copy.howSteps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-[#cfe1f3] bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">0{index + 1}</p>
              <p className="mt-2 font-semibold text-[#021d33]">{step.title}</p>
              <p className="mt-1 text-sm text-slate-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">{copy.regionsTitle}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{copy.regionsLead}</p>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-[#021d33]">{copy.catalogTitle}</h2>
          <Link href={catalog} className="text-sm font-semibold text-[#005B96] hover:underline">
            {copy.catalogCta} →
          </Link>
        </div>
        {source === "demo" ? <p className="mt-2 text-xs text-slate-500">{copy.demoNote}</p> : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {items.map((listing) => (
            <ExchangeListingCard key={listing.id} listing={listing} locale={locale} copy={copy} />
          ))}
        </div>
      </section>

      <p className="mt-10 text-sm text-slate-500">{copy.intermediary}</p>
    </ModulePageShell>
  );
}
