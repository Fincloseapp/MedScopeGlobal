import { headers } from "next/headers";
import { PATHNAME_REQUEST_HEADER } from "@/lib/i18n/config";
import {
  adsAllowedOnPath,
  isAdSenseEnabled,
  resolveAdSenseClientId,
} from "@/lib/monetization/adsense";

/**
 * Official AdSense snippet in <head> — Google’s ownership checker looks for
 * this exact script tag, not a client-only preload.
 */
export async function AdSenseHead() {
  if (!isAdSenseEnabled()) return null;
  const path = (await headers()).get(PATHNAME_REQUEST_HEADER);
  // Missing pathname (OpenNext/Workers) must still load the official snippet.
  // Only skip when we know this is a pro / student / admin / hop surface.
  if (path && !adsAllowedOnPath(path)) return null;
  const client = resolveAdSenseClientId();
  return (
    <>
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
        crossOrigin="anonymous"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `(window.adsbygoogle=window.adsbygoogle||[]).push({google_ad_client:"${client}",enable_page_level_ads:true,overlays:{bottom:true}});`,
        }}
      />
    </>
  );
}
