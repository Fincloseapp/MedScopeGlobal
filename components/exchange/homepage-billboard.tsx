import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExchangeListingCard } from "@/components/exchange/listing-card";
import { ExchangeOriginMark } from "@/components/exchange/origin-mark";
import { EXCHANGE_VISUAL } from "@/lib/brand/exchange-visuals";
import { filterDemoListings } from "@/lib/exchange/seed";
import { AVAILABILITY_REGIONS, regionLabel } from "@/lib/exchange/regions";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { getExchangeMarketing } from "@/lib/i18n/exchange-marketing";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

/** Sync homepage strip — no data fetch, so it cannot stream below the magazine hero. */
export function ExchangeHomepageBillboard({ locale }: { locale: string }) {
  const copy = getExchangeCopy(locale);
  const marketing = getExchangeMarketing(locale);
  const items = filterDemoListings({}).slice(0, 2);
  const catalog = localizePublicHref("/exchange/catalog", locale);
  const onboard = localizePublicHref("/exchange/onboard", locale);
  const home = localizePublicHref("/exchange", locale);

  return (
    <section className="relative overflow-hidden border-b border-[#d5e4f2] bg-[#021d33]">
      <img
        src={EXCHANGE_VISUAL.hero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#021d33]/35" />
      <div className="relative mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)] lg:gap-6 lg:py-12">
        <div className="rounded-3xl bg-white p-6 text-[#021d33] shadow-[0_28px_60px_-32px_rgba(2,29,51,0.65)] sm:p-8">
          <ExchangeOriginMark locale={locale} tone="onLight" />
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[#021d33] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
            {copy.title}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">{copy.lead}</p>

          <ul className="mt-5 grid gap-2 text-sm leading-6 text-slate-700 sm:grid-cols-2">
            {marketing.stats.map((stat) => (
              <li key={stat.label} className="flex items-baseline gap-2 rounded-xl bg-[#f4f8fc] px-3 py-2">
                <span className="shrink-0 font-semibold text-[#021d33]">{stat.value}</span>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={home}
              className="inline-flex items-center rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004a7a]"
            >
              {marketing.ribbonCta}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={catalog}
              className="inline-flex items-center rounded-full border border-[#cfe1f3] bg-white px-5 py-2.5 text-sm font-semibold text-[#021d33] hover:border-[#005B96]"
            >
              {copy.catalogCta}
            </Link>
            <Link
              href={onboard}
              className="inline-flex items-center rounded-full border border-[#cfe1f3] bg-white px-5 py-2.5 text-sm font-semibold text-[#021d33] hover:border-[#005B96]"
            >
              {copy.onboardCta}
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {AVAILABILITY_REGIONS.map((region) => (
              <Link
                key={region}
                href={`${catalog}?regions=${region}`}
                className="rounded-full border border-[#d7e6f4] bg-[#f7fbff] px-3 py-1 text-sm font-medium text-[#005B96] hover:border-[#005B96]"
              >
                {regionLabel(region, locale)}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white/95 p-4 shadow-[0_28px_60px_-32px_rgba(2,29,51,0.65)] sm:p-5">
          <div className="mb-3 flex items-end justify-between gap-3">
            <p className="text-sm font-semibold text-[#021d33]">{marketing.featured}</p>
            <Link href={catalog} className="text-sm font-semibold text-[#005B96] hover:underline">
              {copy.catalogCta} →
            </Link>
          </div>
          <div className="grid gap-3">
            {items.map((listing) => (
              <ExchangeListingCard
                key={listing.id}
                listing={listing}
                locale={locale}
                copy={copy}
                compact
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
