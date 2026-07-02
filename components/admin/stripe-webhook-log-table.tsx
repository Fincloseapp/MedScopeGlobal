import type { StripeWebhookLogRow } from "@/lib/billing/stripe-webhook-log";

export function StripeWebhookLogTable({ logs }: { logs: StripeWebhookLogRow[] }) {
  if (logs.length === 0) {
    return (
      <p className="rounded-xl border bg-white p-6 text-sm text-muted-foreground">
        Zatím žádné webhook události. Po prvním Stripe callbacku se zde zobrazí záznamy z tabulky{" "}
        <code>stripe_webhook_logs</code>.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Přijato</th>
            <th className="px-4 py-3">Typ</th>
            <th className="px-4 py-3">Stav</th>
            <th className="px-4 py-3">Event ID</th>
            <th className="px-4 py-3">Live</th>
            <th className="px-4 py-3">Chyba</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id ?? log.received_at + log.event_type} className="border-b last:border-0">
              <td className="px-4 py-3 whitespace-nowrap">
                {new Date(log.received_at).toLocaleString("cs-CZ")}
              </td>
              <td className="px-4 py-3 font-mono text-xs">{log.event_type}</td>
              <td className="px-4 py-3">
                <span
                  className={
                    log.status === "processed"
                      ? "text-green-700"
                      : log.status === "ignored"
                        ? "text-slate-600"
                        : log.status === "received"
                          ? "text-blue-700"
                          : "text-red-700"
                  }
                >
                  {log.status}
                </span>
              </td>
              <td className="px-4 py-3 max-w-[140px] truncate font-mono text-xs" title={log.event_id ?? ""}>
                {log.event_id ?? "—"}
              </td>
              <td className="px-4 py-3">{log.livemode ? "ano" : "ne"}</td>
              <td className="px-4 py-3 max-w-[200px] truncate text-red-700" title={log.error ?? ""}>
                {log.error ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
