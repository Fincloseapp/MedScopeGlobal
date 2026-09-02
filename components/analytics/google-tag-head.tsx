import {
  isGoogleAnalyticsEnabled,
  resolveGaMeasurementId,
} from "@/lib/analytics/ga";

/**
 * Official Google tag (gtag.js) in <head> — Google’s installer looks for
 * this exact pair of script tags, not a client-only Next.js Script preload.
 * One tag per page. Do not add a second loader in ConsentScripts.
 */
export function GoogleTagHead() {
  if (!isGoogleAnalyticsEnabled()) return null;
  const id = resolveGaMeasurementId();
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  analytics_storage: 'granted',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
gtag('js', new Date());
gtag('config', '${id}', { send_page_view: true });`,
        }}
      />
    </>
  );
}
