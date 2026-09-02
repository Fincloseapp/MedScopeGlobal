"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { CONSENT_EVENT, readConsent } from "@/components/legal/cookie-banner";
import { getClientAdConfig } from "@/lib/ecosystem/monetization";
import { adsAllowedOnPath } from "@/lib/monetization/adsense";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    adsbygoogle?: unknown[];
  }
}

function gaId(): string {
  return (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "").trim();
}

function pushPageView(path: string) {
  const measurementId = gaId();
  if (typeof window === "undefined" || typeof window.gtag !== "function" || !measurementId) {
    return;
  }
  window.gtag("config", measurementId, {
    page_path: path,
    send_page_view: true,
  });
}

/**
 * GA still waits for first-party analytics consent.
 * AdSense + Google Funding Choices CMP load on public magazine paths without
 * our homemade marketing gate — otherwise the EU consent message never appears
 * and AdSense cannot finish site verification via the code snippet.
 */
export function ConsentScripts() {
  const pathname = usePathname();
  const [analytics, setAnalytics] = useState(false);
  const measurementId = gaId();
  const ads = getClientAdConfig();
  const allowAds = adsAllowedOnPath(pathname);
  const pageLevelPushed = useRef(false);

  useEffect(() => {
    function sync() {
      const consent = readConsent();
      setAnalytics(Boolean(consent?.analytics));
    }
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!analytics || !pathname) return;
    pushPageView(pathname);
  }, [analytics, pathname]);

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

  return (
    <>
      {analytics && measurementId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-gtag" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}
    </>
  );
}
