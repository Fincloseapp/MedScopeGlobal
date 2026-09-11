import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import { ExchangeListingCard } from "@/components/exchange/listing-card";
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
    <section className="relative min-h-[32rem] overflow-hidden border-b border-[#0a2a44] bg-[#021d33] text-white">
      <img
        src={EXCHANGE_VISUAL.hero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#021d33]/82 via-[#021d33]/62 to-[#021d33]/30" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:py-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#c4a35a]/50 bg-[#c4a35a]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e8d5a3]">
            <Globe2 className="h-3.5 w-3.5" aria-hidden />
            {marketing.marketplaceName}
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]">
            {copy.title}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-200">{copy.lead}</p>
          <p className="mt-3 max-w-xl text-sm font-medium text-[#e8d5a3]">{marketing.proof}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={home}
              className="inline-flex items-center rounded-full bg-[#c4a35a] px-5 py-2.5 text-sm font-semibold text-[#021d33] hover:bg-[#d4b56a]"
            >
              {marketing.ribbonCta}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={catalog}
              className="inline-flex items-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              {copy.catalogCta}
            </Link>
            <Link
              href={onboard}
              className="inline-flex items-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              {copy.onboardCta}
            </Link>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {marketing.stats.map((stat) => (
              <li key={stat.label} className="rounded-2xl border border-white/15 bg-[#021d33]/50 px-3 py-3 backdrop-blur-sm">
                <p className="font-display text-lg font-semibold leading-6 text-white">{stat.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-300">{stat.label}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
            {AVAILABILITY_REGIONS.map((region) => (
              <Link
                key={region}
                href={`${catalog}?regions=${region}`}
                className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-slate-200 hover:border-[#c4a35a] hover:text-[#e8d5a3]"
              >
                {regionLabel(region, locale)}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e8d5a3]">{marketing.featured}</p>
            <Link href={catalog} className="text-xs font-semibold text-slate-300 hover:text-white">
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
                dark
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
