import { SITE } from "@/lib/config/site";
import Link from "next/link";
import { ExchangeListingCard } from "@/components/exchange/listing-card";
import { ExchangeMarketplaceHero } from "@/components/exchange/marketplace-hero";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { listExchangeListings } from "@/lib/exchange/catalog";
import { exchangeOrganizationJsonLd, faqJsonLd } from "@/lib/exchange/jsonld";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { getExchangeMarketing } from "@/lib/i18n/exchange-marketing";
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
    image: `${SITE.url}/assets/marketing/exchange/hero.webp`,
  });
}

export default async function ExchangeLandingPage() {
  const locale = await getServerLocale();
  const copy = getExchangeCopy(locale);
  const marketing = getExchangeMarketing(locale);
  const { items, source } = await listExchangeListings({ limit: 6 });
  const catalog = localizePublicHref("/exchange/catalog", locale);
  const content = localizePublicHref("/exchange/content", locale);
  const legal = localizePublicHref("/exchange/legal", locale);

  return (
    <div className="bg-[#f4f7fb]">
      <JsonLdScript data={exchangeOrganizationJsonLd(locale)} />
      <JsonLdScript
        data={faqJsonLd(copy.barriers.map((item) => ({ q: item.fear, a: item.flip })))}
      />
      <ExchangeMarketplaceHero locale={locale} />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <section>
          <h2 className="font-display text-2xl font-semibold text-[#021d33]">{marketing.audiencesTitle}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {marketing.audiences.map((item) => (
              <Link
                key={item.id}
                href={catalog}
                className="group overflow-hidden rounded-2xl border border-[#cfe1f3] bg-white shadow-[0_16px_40px_-28px_rgba(2,29,51,0.45)]"
              >
                <span className="relative block h-44">
                  <img src={item.image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                </span>
                <span className="block p-5">
                  <span className="font-display text-lg font-semibold text-[#021d33]">{item.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-slate-600">{item.body}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-[#021d33]">{copy.promiseTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {copy.promises.map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#cfe1f3] bg-white p-5 shadow-[0_16px_40px_-28px_rgba(2,29,51,0.45)]">
                <h3 className="font-display text-lg font-semibold text-[#021d33]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-[#021d33]">{copy.barriersTitle}</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {copy.barriers.map((item) => (
              <li key={item.fear} className="rounded-2xl border border-[#cfe1f3] bg-white p-4">
                <p className="text-sm font-semibold text-slate-800">{item.fear}</p>
                <p className="mt-1 text-sm text-[#005B96]">{item.flip}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-[#021d33]">{copy.howTitle}</h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-5">
            {copy.howSteps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-[#cfe1f3] bg-white p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c4a35a]">0{index + 1}</p>
                <p className="mt-2 font-semibold text-[#021d33]">{step.title}</p>
                <p className="mt-1 text-sm text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 rounded-3xl border border-[#021d33]/10 bg-[#021d33] px-6 py-8 text-white">
          <h2 className="font-display text-2xl font-semibold">{copy.regionsTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{copy.regionsLead}</p>
          <p className="mt-3 text-sm text-[#e8d5a3]">{marketing.proof}</p>
        </section>

        <section className="mt-14">
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

        <div className="mt-12 flex flex-wrap gap-4 text-sm">
          <Link href={content} className="font-semibold text-[#005B96] hover:underline">
            {copy.contentTitle} →
          </Link>
          <Link href={legal} className="font-semibold text-[#005B96] hover:underline">
            {copy.legalHubTitle} →
          </Link>
        </div>
        <p className="mt-8 text-sm text-slate-500">{copy.intermediary}</p>
      </div>
    </div>
  );
}
