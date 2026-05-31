export type AnalyticsEventName =
  | 'article_view'
  | 'subscription_cta_click'
  | 'b2b_cta_click'
  | 'event_registration_click'
  | 'job_apply_click'
  | 'form_submit'
  | 'form_submit_local_fallback';

type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    plausible?: (eventName: string, options?: { props?: AnalyticsPayload }) => void;
  }
}

export function trackEvent(eventName: AnalyticsEventName, payload: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined') return;

  window.dataLayer?.push({ event: eventName, ...payload });
  window.plausible?.(eventName, { props: payload });
}
