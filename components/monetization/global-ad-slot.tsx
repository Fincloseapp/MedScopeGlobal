"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  getClientAdConfig,
  resolveAdProvider,
  type AdPlacement,
  type AdProvider,
} from "@/lib/ecosystem/monetization";
import type { GlobalLocaleCode } from "@/lib/ecosystem/locales";
import { adsAllowedOnPath, resolveAdSenseSlotId } from "@/lib/monetization/adsense";
import { readConsent } from "@/components/legal/cookie-banner";

type Props = {
  provider?: AdProvider;
  placement: AdPlacement;
  locale?: GlobalLocaleCode;
  className?: string;
  /** Numeric AdSense unit id only — never a placement name. */
  slotId?: string;
};

const PLACEMENT_STYLES: Record<AdPlacement, string> = {
  header: "my-4 min-h-[90px] w-full max-w-5xl mx-auto",
  "below-title": "my-4 min-h-[90px] w-full",
  "in-content": "my-6 min-h-[250px] w-full max-w-3xl mx-auto",
  sidebar: "min-h-[250px] w-full",
  footer: "my-6 min-h-[90px] w-full max-w-5xl mx-auto",
  sticky:
    "fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-lg min-h-[50px] md:hidden",
};

const PLACEHOLDER_STYLES: Record<AdPlacement, string> = {
  header: "my-4 min-h-[90px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  "below-title":
    "my-4 min-h-[90px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  "in-content":
    "my-6 min-h-[250px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  sidebar: "min-h-[250px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  footer: "my-6 min-h-[90px] rounded-lg border border-dashed border-slate-300 bg-slate-50",
  sticky:
    "fixed bottom-16 left-0 right-0 z-40 mx-auto max-w-lg min-h-[50px] rounded-t-lg border border-dashed border-slate-300 bg-white/95 md:hidden",
};

/**
 * Manual display unit when a numeric AdSense slot exists.
 * Otherwise Auto ads (page-level) fill the magazine — this renders nothing
 * so we never ship fake slot names like "below-title".
 */
export function GlobalAdSlot({
  provider: providerProp,
  placement,
  locale = "cs",
  className = "",
  slotId,
}: Props) {
  const pathname = usePathname();
  const config = getClientAdConfig();
  const provider = providerProp ?? resolveAdProvider(locale, config);
  const style = PLACEMENT_STYLES[placement] ?? PLACEMENT_STYLES["in-content"];
  const numericSlot = resolveAdSenseSlotId(placement, slotId);
  const pushed = useRef(false);
  const [marketingOk, setMarketingOk] = useState(false);
  const allowed = adsAllowedOnPath(pathname);

  useEffect(() => {
    setMarketingOk(Boolean(readConsent()?.marketing));
  }, []);

  useEffect(() => {
    if (
      !allowed ||
      !marketingOk ||
      !config.enabled ||
      provider !== "adsense" ||
      !config.adsenseClientId ||
      !numericSlot
    ) {
      return;
    }
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* loader may still be fetching */
    }
  }, [allowed, marketingOk, config.enabled, config.adsenseClientId, provider, numericSlot]);

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

  if (!marketingOk) {
    return null;
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
          className="adsbygoogle block w-full"
          style={{ display: "block" }}
          data-ad-client={config.adsenseClientId}
          data-ad-slot={numericSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
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
