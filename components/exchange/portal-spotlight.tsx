import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExchangeOriginMark } from "@/components/exchange/origin-mark";
import { EXCHANGE_VISUAL } from "@/lib/brand/exchange-visuals";
import { getExchangeCopy } from "@/lib/i18n/exchange-copy";
import { getExchangeMarketing } from "@/lib/i18n/exchange-marketing";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function ExchangePortalSpotlight({ locale }: { locale: string }) {
  const copy = getExchangeCopy(locale);
  const marketing = getExchangeMarketing(locale);
  const href = localizePublicHref("/exchange", locale);

  return (
    <Link
      href={href}
      className="relative mt-3 block overflow-hidden rounded-2xl border border-[#cfe1f3] shadow-sm"
    >
      <span className="relative block min-h-[10rem] sm:min-h-[12rem]">
        <Image
          src={EXCHANGE_VISUAL.diagnostics}
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 1120px"
        />
        <span className="absolute inset-0 bg-[#021d33]/25" />
        <span className="relative z-10 flex h-full items-center px-4 py-5 sm:px-6">
          <span className="max-w-xl rounded-2xl bg-white p-5 text-[#021d33] shadow-[0_20px_40px_-24px_rgba(2,29,51,0.55)] sm:p-6">
            <ExchangeOriginMark locale={locale} tone="onLight" />
            <span className="mt-2 block font-display text-2xl font-semibold leading-snug sm:text-[1.7rem]">
              {copy.title}
            </span>
            <span className="mt-3 inline-flex items-center text-sm font-semibold text-[#005B96]">
              {marketing.ribbonCta}
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
            </span>
          </span>
        </span>
      </span>
    </Link>
  );
}
