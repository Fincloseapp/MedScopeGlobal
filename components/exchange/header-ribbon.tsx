import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getExchangeMarketing } from "@/lib/i18n/exchange-marketing";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function ExchangeHeaderRibbon({ locale }: { locale: string }) {
  const marketing = getExchangeMarketing(locale);
  const href = localizePublicHref("/exchange", locale);

  return (
    <div className="exchange-header-ribbon border-b border-[#c4a35a]/40 bg-[#021d33] text-white">
      <Link
        href={href}
        className="mx-auto flex max-w-[1680px] items-center justify-between gap-3 px-4 py-2.5 text-sm leading-6 sm:px-6 lg:px-6"
      >
        <span className="min-w-0 font-medium">
          <span className="mr-2 inline-flex rounded-full bg-[#c4a35a] px-2 py-0.5 text-xs font-bold text-[#021d33]">
            B2B
          </span>
          {marketing.ribbon}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#e8d5a3]">
          {marketing.ribbonCta}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </Link>
    </div>
  );
}
