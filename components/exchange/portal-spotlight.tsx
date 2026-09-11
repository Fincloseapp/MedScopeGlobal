import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      className="relative mt-3 block overflow-hidden rounded-lg border border-[#c4a35a]/50 shadow-sm"
    >
      <span className="relative block min-h-[9.5rem] sm:min-h-[11rem]">
        <Image
          src={EXCHANGE_VISUAL.diagnostics}
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 1120px"
        />
        <span className="absolute inset-0 bg-gradient-to-r from-[#021d33] via-[#021d33]/85 to-[#021d33]/35" />
        <span className="relative z-10 flex h-full flex-col justify-center px-4 py-5 sm:px-6">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#e8d5a3]">
            {marketing.marketplaceName}
          </span>
          <span className="mt-1 max-w-xl font-display text-xl font-semibold text-white sm:text-2xl">
            {copy.title}
          </span>
          <span className="mt-2 inline-flex items-center text-sm font-semibold text-[#e8d5a3]">
            {marketing.ribbonCta}
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </span>
        </span>
      </span>
    </Link>
  );
}
