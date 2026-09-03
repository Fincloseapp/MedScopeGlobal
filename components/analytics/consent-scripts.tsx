"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { grantAnalyticsConsent, trackPageView } from "@/lib/analytics";

/**
 * SPA pageviews only.
 * AdSense Auto ads come from the official <head> snippet (`adsbygoogle.js?client=`).
 * Do not add a second page-level ads object — that legacy call breaks the in-article unit.
 * Do not gate gtag on the homemade analytics cookie.
 */
export function ConsentScripts() {
  const pathname = usePathname();
  const countedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const send = () => {
      grantAnalyticsConsent();
      trackPageView(pathname);
    };
    if (countedPath.current === null) {
      countedPath.current = pathname;
      const t = window.setTimeout(send, 800);
      return () => window.clearTimeout(t);
    }
    if (countedPath.current === pathname) return;
    countedPath.current = pathname;
    send();
  }, [pathname]);

  return null;
}
