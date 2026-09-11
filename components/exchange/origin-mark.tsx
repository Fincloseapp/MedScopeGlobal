import { getExchangeMarketing } from "@/lib/i18n/exchange-marketing";
import { SITE } from "@/lib/config/site";
import { cn } from "@/lib/utils";

const ORIGIN_HOST = "MedScopeGlobal.com";

/** Always-visible B2B + MedScopeGlobal.com mark for marketplace chrome. */
export function ExchangeOriginMark({
  locale,
  tone = "onLight",
}: {
  locale: string;
  tone?: "onLight" | "onDark";
}) {
  const marketing = getExchangeMarketing(locale);
  const onLight = tone === "onLight";
  return (
    <p
      className={cn(
        "flex flex-wrap items-center gap-x-2.5 gap-y-1 text-base font-semibold leading-7",
        onLight ? "text-[#021d33]" : "text-white"
      )}
    >
      <span className="rounded-full bg-[#c4a35a] px-2.5 py-0.5 text-xs font-bold text-[#021d33]">
        B2B
      </span>
      <span>{marketing.originLine}</span>
    </p>
  );
}

export function exchangeOriginHost(): string {
  return ORIGIN_HOST;
}

export function exchangeOriginHref(): string {
  return SITE.url;
}
