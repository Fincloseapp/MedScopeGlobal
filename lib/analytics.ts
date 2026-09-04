import { resolveGaMeasurementId } from "@/lib/analytics/ga";

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

  const search = window.location.search || "";
  window.gtag("config", measurementId, {
    page_path: path,
    page_location: `${window.location.origin}${path}${search}`,
    send_page_view: true,
    cookie_domain: "medscopeglobal.com",
    cookie_flags: "SameSite=Lax;Secure",
  });
}
