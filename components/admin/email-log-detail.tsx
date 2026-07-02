import type { EmailLogRow } from "@/lib/email/log";

export function EmailLogDetail({ log }: { log: EmailLogRow }) {
  return (
    <div className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="font-semibold text-medical-navy">Detail e-mailu</h2>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Datum</dt>
          <dd>{new Date(log.sent_at).toLocaleString("cs-CZ")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Typ</dt>
          <dd>{log.email_type}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Příjemce</dt>
          <dd>{log.recipient}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Předmět</dt>
          <dd>{log.subject}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Stav</dt>
          <dd>
            {log.status}
            {log.response_code != null ? ` (HTTP ${log.response_code})` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Provider</dt>
          <dd>
            {log.provider}
            {log.fallback_used ? " (fallback)" : ""}
          </dd>
        </div>
        {log.message_id ? (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Message ID</dt>
            <dd className="font-mono text-xs">{log.message_id}</dd>
          </div>
        ) : null}
        {log.error ? (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Chyba</dt>
            <dd className="text-red-700">{log.error}</dd>
          </div>
        ) : null}
        {log.metadata && Object.keys(log.metadata).length > 0 ? (
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Metadata</dt>
            <dd>
              <pre className="mt-1 overflow-x-auto rounded bg-muted p-3 text-xs">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
