import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExchangeOriginMark } from "@/components/exchange/origin-mark";
import { EXCHANGE_VISUAL } from "@/lib/brand/exchange-visuals";
import { AVAILABILITY_REGIONS, regionLabel } from "@/lib/exchange/regions";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { getExchangeMarketing } from "@/lib/i18n/exchange-marketing";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function ExchangeMarketplaceHero({ locale }: { locale: string }) {
  const copy = getExchangeCopy(locale);
  const marketing = getExchangeMarketing(locale);
  const catalog = localizePublicHref("/exchange/catalog", locale);
  const onboard = localizePublicHref("/exchange/onboard", locale);
  const pricing = localizePublicHref("/exchange/pricing", locale);

  return (
    <section className="relative overflow-hidden border-b border-[#d5e4f2] bg-[#021d33]">
      <img
        src={EXCHANGE_VISUAL.hero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#021d33]/30" />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-3xl rounded-3xl bg-white p-6 text-[#021d33] shadow-[0_28px_60px_-32px_rgba(2,29,51,0.65)] sm:p-9">
          <ExchangeOriginMark locale={locale} tone="onLight" />
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">{copy.lead}</p>

          <ul className="mt-6 grid gap-2 text-sm leading-6 text-slate-700 sm:grid-cols-2">
            {marketing.stats.map((stat) => (
              <li key={stat.label} className="flex items-baseline gap-2 rounded-xl bg-[#f4f8fc] px-3 py-2.5">
                <span className="shrink-0 font-semibold text-[#021d33]">{stat.value}</span>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={catalog}
              className="inline-flex items-center rounded-full bg-[#005B96] px-6 py-3 text-sm font-semibold text-white hover:bg-[#004a7a]"
            >
              {copy.catalogCta}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={onboard}
              className="inline-flex items-center rounded-full border border-[#cfe1f3] bg-white px-6 py-3 text-sm font-semibold text-[#021d33] hover:border-[#005B96]"
            >
              {copy.onboardCta}
            </Link>
            <Link
              href={pricing}
              className="inline-flex items-center rounded-full border border-[#cfe1f3] bg-white px-6 py-3 text-sm font-semibold text-[#021d33] hover:border-[#005B96]"
            >
              {copy.pricingCta}
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {AVAILABILITY_REGIONS.map((region) => (
              <Link
                key={region}
                href={`${catalog}?regions=${region}`}
                className="rounded-full border border-[#d7e6f4] bg-[#f7fbff] px-3.5 py-1.5 text-sm font-medium text-[#005B96] hover:border-[#005B96]"
              >
                {regionLabel(region, locale)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
