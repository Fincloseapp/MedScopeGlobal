import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExchangeOriginMark } from "@/components/exchange/origin-mark";
import { EXCHANGE_VISUAL } from "@/lib/brand/exchange-visuals";
import { getMarketingCopy } from "@/lib/i18n/marketing-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

/** Editorial marketplace band for About — photography + readable type, no large tiles. */
export function ExchangeAboutMarketplace({ locale }: { locale: string }) {
  const copy = getMarketingCopy(locale).about;
  const href = localizePublicHref("/exchange", locale);

  return (
    <section className="relative mb-12 overflow-hidden bg-[#021d33]">
      <img
        src={EXCHANGE_VISUAL.hero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#021d33] via-[#021d33]/82 to-[#021d33]/30" />

      <div className="relative px-5 py-10 sm:px-8 sm:py-12">
        <ExchangeOriginMark locale={locale} tone="onDark" />
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {copy.marketplaceTitle}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
          {copy.marketplaceLead}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#e8d5a3]/90">{copy.marketplaceProof}</p>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            href={href}
            className="inline-flex items-center rounded-full bg-[#c4a35a] px-5 py-2.5 text-sm font-semibold text-[#021d33] hover:bg-[#d4b56a]"
          >
            {copy.marketplaceCta}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </div>

        <ul className="mt-8 grid max-w-3xl gap-5 sm:grid-cols-3">
          {copy.marketplacePoints.map((item) => (
            <li key={item.title}>
              <p className="text-sm font-semibold text-[#e8d5a3]">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-white/80">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
