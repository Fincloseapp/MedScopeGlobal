import Link from "next/link";
import { Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getExchangeMarketing } from "@/lib/i18n/exchange-marketing";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export function ExchangeNavCta({
  locale,
  compact = false,
  className,
}: {
  locale: string;
  compact?: boolean;
  className?: string;
}) {
  const marketing = getExchangeMarketing(locale);
  return (
    <Link
      href={localizePublicHref("/exchange", locale)}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full font-semibold text-[#021d33]",
        "border border-[#c4a35a] bg-[#f7efd8] shadow-sm hover:bg-[#efe2bc]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c4a35a]",
        compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        className
      )}
    >
      <Globe2 className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      {marketing.navCta}
    </Link>
  );
}
