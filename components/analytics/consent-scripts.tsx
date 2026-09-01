"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { CONSENT_EVENT, readConsent } from "@/components/legal/cookie-banner";
import { getClientAdConfig } from "@/lib/ecosystem/monetization";

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
 * Loads GA and AdSense only after cookie consent (analytics / marketing).
 * No-ops when measurement / client IDs are unset.
 */
export function ConsentScripts() {
  const pathname = usePathname();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const measurementId = gaId();
  const ads = getClientAdConfig();

  useEffect(() => {
    function sync() {
      const consent = readConsent();
      setAnalytics(Boolean(consent?.analytics));
      setMarketing(Boolean(consent?.marketing));
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
    if (!marketing || !ads.enabled || !ads.adsenseClientId) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* AdSense may not be ready yet */
    }
  }, [marketing, ads.enabled, ads.adsenseClientId, pathname]);

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
      {marketing && ads.enabled && ads.adsenseClientId ? (
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ads.adsenseClientId}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      ) : null}
    </>
  );
}
