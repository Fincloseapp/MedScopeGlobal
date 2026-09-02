import { headers } from "next/headers";
import Script from "next/script";
import { PATHNAME_REQUEST_HEADER } from "@/lib/i18n/config";
import {
  adsAllowedOnPath,
  isAdSenseEnabled,
  resolveAdSenseClientId,
} from "@/lib/monetization/adsense";

/**
 * Server-rendered AdSense tag on public magazine routes.
 * Google’s ownership check and Funding Choices CMP both need this in HTML
 * without waiting for a first-party cookie click.
 */
export async function AdSenseHead() {
  if (!isAdSenseEnabled()) return null;
  const path = (await headers()).get(PATHNAME_REQUEST_HEADER);
  if (path && !adsAllowedOnPath(path)) return null;
  const client = resolveAdSenseClientId();
  return (
    <Script
      id="adsense-auto-ssr"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
