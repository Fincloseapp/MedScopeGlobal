/**
 * In-process Exchange telemetry. Cloudflare Workers are ephemeral; this is a
 * process snapshot plus structured log hooks. Production persistence uses
 * `exchange_audit_events` / `logAdminEvent`.
 */

export type ExchangeMetricName =
  | "inquiry_created"
  | "inquiry_redacted_view"
  | "inquiry_full_view"
  | "inquiry_reply"
  | "inquiry_reply_blocked"
  | "subscribe"
  | "ads_order_blocked"
  | "ads_order"
  | "import_blocked"
  | "api_error";

type CounterMap = Record<string, number>;

const counters: CounterMap = {};

export function recordExchangeMetric(
  name: ExchangeMetricName,
  tags: Record<string, string | number | boolean | null | undefined> = {}
) {
  counters[name] = (counters[name] ?? 0) + 1;
  const key = `${name}:${tags.plan ?? ""}:${tags.region ?? ""}:${tags.locale ?? ""}`;
  counters[key] = (counters[key] ?? 0) + 1;
  console.info("[exchange]", name, tags);
}

export function snapshotExchangeMetrics() {
  return {
    uptimeMs: Math.round(process.uptime() * 1000),
    counters: { ...counters },
    alerts: {
      errorSpike: (counters.api_error ?? 0) > 25,
      latencySpike: false,
      downtime: false,
    },
  };
}
