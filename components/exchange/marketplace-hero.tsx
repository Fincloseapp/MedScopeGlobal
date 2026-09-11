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
    <section className="relative overflow-hidden bg-[#021d33]">
      <img
        src={EXCHANGE_VISUAL.hero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#021d33] via-[#021d33]/80 to-[#021d33]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#021d33]/55 via-transparent to-[#021d33]/25" />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <ExchangeOriginMark locale={locale} tone="onDark" />
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/90">{copy.lead}</p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#e8d5a3]/90">{marketing.proof}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href={catalog}
              className="inline-flex items-center rounded-full bg-[#c4a35a] px-6 py-3 text-sm font-semibold text-[#021d33] hover:bg-[#d4b56a]"
            >
              {copy.catalogCta}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link href={onboard} className="text-sm font-semibold text-white/90 underline-offset-4 hover:text-white hover:underline">
              {copy.onboardCta}
            </Link>
            <Link href={pricing} className="text-sm font-semibold text-white/70 underline-offset-4 hover:text-white hover:underline">
              {copy.pricingCta}
            </Link>
          </div>

          <p className="mt-7 text-sm text-white/70">
            {AVAILABILITY_REGIONS.map((region, index) => (
              <span key={region}>
                {index > 0 ? <span className="mx-2 text-white/35">·</span> : null}
                <Link href={`${catalog}?regions=${region}`} className="hover:text-white">
                  {regionLabel(region, locale)}
                </Link>
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
