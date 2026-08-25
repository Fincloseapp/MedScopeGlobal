"use client";

import type { AdProvider, AdPlacement } from "@/lib/ecosystem/monetization";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";

type Props = {
  provider?: AdProvider;
  placement: AdPlacement;
  locale?: GlobalLocaleCode;
  className?: string;
};

const PLACEMENT_STYLES: Record<AdPlacement, string> = {
  header: "my-4 min-h-[90px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  "below-title": "my-4 min-h-[250px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  "in-content": "my-6 min-h-[280px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  sidebar: "min-h-[600px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  footer: "my-6 min-h-[90px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  sticky: "fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-lg min-h-[50px] rounded-t-lg border border-slate-300 bg-white shadow-lg md:hidden",
};

/** Global ad slot — renders provider-specific script when env vars are set */
export function GlobalAdSlot({ provider = "adsense", placement, locale = "cs", className = "" }: Props) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const style = PLACEMENT_STYLES[placement] ?? PLACEMENT_STYLES["in-content"];

  if (provider === "adsense" && adsenseId) {
    return (
      <div className={`${style} ${className}`} aria-label="Reklama">
        <ins
          className="adsbygoogle block w-full"
          style={{ display: "block" }}
          data-ad-client={adsenseId}
          data-ad-slot={placement}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div className={`${style} flex items-center justify-center ${className}`} aria-label="Reklama">
      <span className="text-xs text-slate-400">
        {provider.toUpperCase()} · {placement} · {locale}
      </span>
    </div>
  );
}
