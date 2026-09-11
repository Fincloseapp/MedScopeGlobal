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
    <Link href={href} className="relative mt-5 block overflow-hidden">
      <span className="relative block min-h-[9.5rem] sm:min-h-[11rem]">
        <Image
          src={EXCHANGE_VISUAL.diagnostics}
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 1120px"
        />
        <span className="absolute inset-0 bg-gradient-to-r from-[#021d33] via-[#021d33]/75 to-[#021d33]/15" />
        <span className="relative z-10 flex h-full flex-col justify-center px-5 py-6 sm:px-8">
          <ExchangeOriginMark locale={locale} tone="onDark" />
          <span className="mt-2 max-w-xl font-display text-2xl font-semibold leading-snug text-white sm:text-[1.75rem]">
            {copy.title}
          </span>
          <span className="mt-3 inline-flex items-center text-sm font-semibold text-[#e8d5a3]">
            {marketing.ribbonCta}
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
          </span>
        </span>
      </span>
    </Link>
  );
}
