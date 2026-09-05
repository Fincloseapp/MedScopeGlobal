import {
  GA_FIRST_PARTY_PREFIX,
  isGoogleAnalyticsEnabled,
  resolveGaMeasurementId,
} from "@/lib/analytics/ga";

/**
 * Official Google tag in <head>. Collect must leave the browser and hit
 * google-analytics.com directly — that is what Realtime actually counts.
 *
 * The old /relay transport_url + first_party_collection setup is server-side
 * GTM, not a dumb Worker reverse-proxy. Hits then arrive from Cloudflare
 * datacenter IPs and GA4 drops them as bots, so Realtime stays at 0 even
 * while you are on the page. Keep /relay only as a script fallback when
 * googletagmanager.com is blocked.
 */
export function GoogleTagHead() {
  if (!isGoogleAnalyticsEnabled()) return null;
  const id = resolveGaMeasurementId();
  const fallback = `${GA_FIRST_PARTY_PREFIX}/js?id=${id}`;
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
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
  cookie_domain: 'medscopeglobal.com',
  cookie_flags: 'SameSite=Lax;Secure'
});
(function(){
  var nodes=document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
  var s=nodes[nodes.length-1];
  if(!s) return;
  s.addEventListener('error', function(){
    var f=document.createElement('script');
    f.async=true;
    f.src='${fallback}';
    document.head.appendChild(f);
  });
})();`,
        }}
      />
    </>
  );
}
