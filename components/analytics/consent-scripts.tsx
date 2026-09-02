"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";
import { getClientAdConfig } from "@/lib/ecosystem/monetization";
import { adsAllowedOnPath } from "@/lib/monetization/adsense";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * SPA pageviews + Auto ads page-level push.
 * The official gtag lives in <head> (GoogleTagHead) — do not load a second copy here.
 * Do not gate gtag on the homemade analytics cookie; magazine paths hide that banner
 * for Google Funding Choices CMP.
 */
export function ConsentScripts() {
  const pathname = usePathname();
  const ads = getClientAdConfig();
  const allowAds = adsAllowedOnPath(pathname);
  const pageLevelPushed = useRef(false);
  const countedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (countedPath.current === null) {
      countedPath.current = pathname;
      return;
    }
    if (countedPath.current === pathname) return;
    countedPath.current = pathname;
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    if (pageLevelPushed.current || !allowAds || !ads.enabled || !ads.adsenseClientId) {
      return;
    }
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: ads.adsenseClientId,
        enable_page_level_ads: true,
        overlays: { bottom: true },
      });
      pageLevelPushed.current = true;
    } catch {
      /* script may still be fetching */
    }
  }, [allowAds, ads.enabled, ads.adsenseClientId]);

  return null;
}
