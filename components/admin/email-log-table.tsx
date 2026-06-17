import Link from "next/link";
import type { EmailLogRow } from "@/lib/email/log";

export function EmailLogTable({ logs }: { logs: EmailLogRow[] }) {
  if (logs.length === 0) {
    return (
      <p className="rounded-xl border bg-white p-6 text-sm text-muted-foreground">
        Zatím žádné záznamy. Po prvním odeslání e-mailu se zde zobrazí logy z tabulky{" "}
        <code>email_logs</code>.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Datum</th>
            <th className="px-4 py-3">Typ</th>
            <th className="px-4 py-3">Příjemce</th>
            <th className="px-4 py-3">Předmět</th>
            <th className="px-4 py-3">Stav</th>
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Fallback</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id ?? log.sent_at + log.recipient} className="border-b last:border-0">
              <td className="px-4 py-3 whitespace-nowrap">
                {new Date(log.sent_at).toLocaleString("cs-CZ")}
              </td>
              <td className="px-4 py-3">{log.email_type}</td>
              <td className="px-4 py-3 max-w-[160px] truncate" title={log.recipient}>
                {log.recipient}
              </td>
              <td className="px-4 py-3 max-w-[200px] truncate" title={log.subject}>
                {log.subject}
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    log.status === "sent"
                      ? "text-green-700"
                      : log.status === "skipped"
                        ? "text-amber-700"
                        : "text-red-700"
                  }
                >
                  {log.status}
                  {log.response_code != null ? ` (${log.response_code})` : ""}
                </span>
              </td>
              <td className="px-4 py-3">{log.provider}</td>
              <td className="px-4 py-3">{log.fallback_used ? "ano" : "—"}</td>
              <td className="px-4 py-3">
                {log.id ? (
                  <Link href={`/admin/email-logs?detail=${log.id}`} className="text-primary hover:underline">
                    Detail
                  </Link>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
