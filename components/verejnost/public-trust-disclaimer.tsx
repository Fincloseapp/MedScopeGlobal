import { AlertTriangle } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getMarketingCopy } from "@/lib/i18n/marketing-copy";

type Props = {
  variant?: "banner" | "inline";
  className?: string;
};

export async function PublicTrustDisclaimer({ variant = "banner", className = "" }: Props) {
  const locale = await getServerLocale();
  const copy = getMarketingCopy(locale);

  if (variant === "inline") {
    return (
      <p className={`text-xs leading-relaxed text-slate-500 ${className}`}>
        {copy.disclaimerInline}
      </p>
    );
  }

  return (
    <div
      className={`flex gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3.5 ${className}`}
      role="note"
      aria-label={copy.disclaimerAria}
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
      <div>
        <p className="text-sm font-semibold text-amber-950">{copy.disclaimerTitle}</p>
        <p className="mt-1 text-sm leading-relaxed text-amber-900/90">{copy.disclaimerBanner}</p>
      </div>
    </div>
  );
}
