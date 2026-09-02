import { GA_FIRST_PARTY_PREFIX, resolveGaMeasurementId } from "@/lib/analytics/ga";
import { getSiteUrl } from "@/lib/config/site-url";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function grantAnalyticsConsent() {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  });
}

export function trackEvent(
  eventName: string,
  params: Record<string, unknown> = {}
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params);
}

export function trackPageView(path: string) {
  const measurementId = resolveGaMeasurementId();
  if (typeof window === "undefined" || typeof window.gtag !== "function" || !measurementId) {
    return;
  }

  window.gtag("config", measurementId, {
    page_path: path,
    send_page_view: true,
    transport_url: `${getSiteUrl()}${GA_FIRST_PARTY_PREFIX}`,
    first_party_collection: true,
  });
}
