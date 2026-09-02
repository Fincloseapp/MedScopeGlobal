import { getSiteUrl } from "@/lib/config/site-url";
import {
  GA_FIRST_PARTY_PREFIX,
  isGoogleAnalyticsEnabled,
  resolveGaMeasurementId,
} from "@/lib/analytics/ga";

/**
 * Google tag in <head>. Script + collect go through the same-origin
 * /__ms hop so ad blockers (the usual reason Realtime stays empty for
 * the site owner) do not drop the hit. One tag only.
 */
export function GoogleTagHead() {
  if (!isGoogleAnalyticsEnabled()) return null;
  const id = resolveGaMeasurementId();
  const transport = `${getSiteUrl()}${GA_FIRST_PARTY_PREFIX}`;
  return (
    <>
      <script async src={`${GA_FIRST_PARTY_PREFIX}/js?id=${id}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  analytics_storage: 'granted',
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted'
});
gtag('js', new Date());
gtag('config', '${id}', {
  send_page_view: true,
  transport_url: '${transport}',
  first_party_collection: true
});`,
        }}
      />
    </>
  );
}
