"use client";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import type { AnalyticsPayload } from "@/lib/analytics";
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; } }
const gaId = process.env.NEXT_PUBLIC_GA_ID;
export function trackClientEvent(payload: AnalyticsPayload) { if (typeof window !== "undefined") { window.gtag?.("event", payload.name, payload.value ?? {}); void fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), keepalive: true }).catch(() => undefined); } }
export function AnalyticsProvider() {
  const pathname = usePathname(); const searchParams = useSearchParams();
  useEffect(() => { const url = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`; window.gtag?.("config", gaId, { page_path: url }); trackClientEvent({ name: "visit", value: { path: url } }); }, [pathname, searchParams]);
  if (!gaId) return null;
  return <><Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" /><Script id="ga4" strategy="afterInteractive">{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}', { anonymize_ip: true });`}</Script></>;
}
