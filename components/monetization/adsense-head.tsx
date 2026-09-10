import { headers } from "next/headers";
import { PATHNAME_REQUEST_HEADER } from "@/lib/i18n/config";
import {
  adsAllowedOnPath,
  isAdSenseEnabled,
  resolveAdSenseClientId,
} from "@/lib/monetization/adsense";

/**
 * Official Auto ads snippet in <head> — the exact tag Google issues:
 * <script async src="…/adsbygoogle.js?client=ca-pub-…" crossorigin="anonymous"></script>
 *
 * Do not add a second page-level ads object. The ?client= URL already
 * starts Auto ads; the legacy push fights the in-article unit.
 */
export async function AdSenseHead() {
  if (!isAdSenseEnabled()) return null;
  const path = (await headers()).get(PATHNAME_REQUEST_HEADER);
  // Missing pathname (OpenNext/Workers) must still load the official snippet.
  // Only skip when we know this is a pro / student / admin / hop surface.
  if (path && !adsAllowedOnPath(path)) return null;
  const client = resolveAdSenseClientId();
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
    />
  );
}
