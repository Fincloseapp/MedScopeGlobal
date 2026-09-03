"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}
import { usePathname } from "next/navigation";
import {
  getClientAdConfig,
  resolveAdProvider,
  type AdPlacement,
  type AdProvider,
} from "@/lib/ecosystem/monetization";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { adsAllowedOnPath, resolveAdSenseSlotId } from "@/lib/monetization/adsense";

type Props = {
  provider?: AdProvider;
  placement: AdPlacement;
  locale?: GlobalLocaleCode;
  className?: string;
  /** Numeric AdSense unit id only — never a placement name. */
  slotId?: string;
  /** Official in-article unit (fluid + centered). */
  layout?: "auto" | "in-article";
};

const PLACEMENT_STYLES: Record<string, string> = {
  header: "my-4 min-h-[90px] w-full max-w-5xl mx-auto",
  "below-title": "my-4 min-h-[90px] w-full",
  "in-content": "my-6 w-full max-w-3xl mx-auto",
  "in-article": "my-8 w-full max-w-3xl mx-auto",
  sidebar: "min-h-[250px] w-full",
  footer: "my-6 min-h-[90px] w-full max-w-5xl mx-auto",
  sticky: "fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-lg min-h-[50px] md:hidden",
};

const PLACEHOLDER_STYLES: Record<string, string> = {
  header: "my-4 min-h-[90px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  "below-title":
    "my-4 min-h-[90px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  "in-content":
    "my-6 min-h-[250px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  "in-article":
    "my-8 min-h-[120px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  sidebar: "min-h-[250px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  footer: "my-6 min-h-[90px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  sticky:
    "fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-lg min-h-[50px] rounded-t-lg border border-dashed border-slate-300 bg-white/95 md:hidden",
};

/**
 * Manual display unit when a numeric AdSense slot exists.
 * Consent for EEA is Google Funding Choices (TCF), not our homemade banner.
 */
export function GlobalAdSlot({
  provider: providerProp,
  placement,
  locale = "cs",
  className = "",
  slotId,
  layout = "auto",
}: Props) {
  const pathname = usePathname();
  const config = getClientAdConfig();
  const provider = providerProp ?? resolveAdProvider(locale, config);
  const style = PLACEMENT_STYLES[placement] ?? PLACEMENT_STYLES["in-content"];
  const numericSlot = resolveAdSenseSlotId(placement, slotId);
  const inArticle = layout === "in-article" || placement === "in-article";
  const pushed = useRef(false);
  const allowed = adsAllowedOnPath(pathname);

  useEffect(() => {
    if (!allowed || !config.enabled || provider !== "adsense" || !config.adsenseClientId || !numericSlot) {
      return;
    }
    if (pushed.current) return;
    let cancelled = false;
    const request = () => {
      if (cancelled || pushed.current) return;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        /* loader may still be fetching */
      }
    };
    request();
    if (pushed.current) return;
    const tick = window.setInterval(request, 400);
    const stop = window.setTimeout(() => window.clearInterval(tick), 8000);
    return () => {
      cancelled = true;
      window.clearInterval(tick);
      window.clearTimeout(stop);
    };
  }, [allowed, config.enabled, config.adsenseClientId, provider, numericSlot]);

  if (!allowed || !config.enabled || !provider) {
    if (!config.showPlaceholders) return null;
    const ph = PLACEHOLDER_STYLES[placement] ?? PLACEHOLDER_STYLES["in-content"];
    return (
      <div
        className={`${ph} flex items-center justify-center ${className}`}
        aria-hidden
        data-ad-placeholder={placement}
      >
        <span className="text-xs text-slate-400">
          Ad preview · {placement} · {locale}
        </span>
      </div>
    );
  }

  if (provider === "adsense" && config.adsenseClientId && numericSlot) {
    return (
      <div
        className={`${style} ${className}`}
        aria-label="Advertisement"
        data-ad-placement={placement}
        data-ad-provider="adsense"
      >
        <ins
          className="adsbygoogle"
          style={
            inArticle
              ? { display: "block", textAlign: "center" }
              : { display: "block" }
          }
          data-ad-client={config.adsenseClientId}
          data-ad-slot={numericSlot}
          {...(inArticle
            ? { "data-ad-layout": "in-article", "data-ad-format": "fluid" }
            : { "data-ad-format": "auto", "data-full-width-responsive": "true" })}
        />
      </div>
    );
  }

  if (provider === "mediavine" && config.mediavineSiteId) {
    return (
      <div
        className={`${style} ${className}`}
        aria-label="Advertisement"
        data-ad-placement={placement}
        data-ad-provider="mediavine"
        data-mediavine-site={config.mediavineSiteId}
      />
    );
  }

  if (provider === "ezoic" && config.ezoicSiteId) {
    return (
      <div
        className={`${style} ${className}`}
        aria-label="Advertisement"
        data-ad-placement={placement}
        data-ad-provider="ezoic"
        id={`ezoic-pub-ad-placeholder-${placement}`}
        data-ezoic-site={config.ezoicSiteId}
      />
    );
  }

  return null;
}
