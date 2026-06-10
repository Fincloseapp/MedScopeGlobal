import type { V25Alert, V25FixRecord, V25ScreenshotEntry } from "@/lib/v25/types";

export function FixHistoryTable({ history }: { history: V25FixRecord[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">Zatím žádné záznamy oprav.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-slate-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Datum</th>
            <th className="px-4 py-3 font-medium">Typ</th>
            <th className="px-4 py-3 font-medium">Modul</th>
            <th className="px-4 py-3 font-medium">Akce</th>
            <th className="px-4 py-3 font-medium">Výsledek</th>
          </tr>
        </thead>
        <tbody>
          {history.slice(0, 30).map((h) => (
            <tr key={h.id} className="border-b last:border-0">
              <td className="px-4 py-3 whitespace-nowrap">
                {new Date(h.at).toLocaleString("cs-CZ")}
              </td>
              <td className="px-4 py-3">{h.errorType}</td>
              <td className="px-4 py-3">{h.module}</td>
              <td className="px-4 py-3">{h.action}</td>
              <td className="px-4 py-3 uppercase">{h.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AlertsList({ alerts }: { alerts: V25Alert[] }) {
  if (alerts.length === 0) {
    return <p className="text-sm text-muted-foreground">Žádné alerty.</p>;
  }

  return (
    <ul className="space-y-2">
      {alerts.slice(0, 20).map((a) => (
        <li key={a.id} className="rounded-lg border bg-white px-4 py-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-primary">{a.type}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(a.at).toLocaleString("cs-CZ")}
            </span>
          </div>
          <p className="mt-1">{a.message}</p>
          {a.logFile ? (
            <p className="mt-1 text-xs text-muted-foreground">Log: {a.logFile}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function ScreenshotGrid({ shots }: { shots: V25ScreenshotEntry[] }) {
  if (shots.length === 0) {
    return <p className="text-sm text-muted-foreground">Screenshoty zatím nebyly pořízeny.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {shots.map((s) => (
        <div key={`${s.id}-${s.timestamp}`} className="rounded-xl border bg-white p-4">
          <p className="font-semibold text-[#021d33]">{s.id}</p>
          <p className="text-xs text-muted-foreground">{s.path}</p>
          <p className="mt-1 text-xs">{s.title ?? "—"}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {new Date(s.timestamp).toLocaleString("cs-CZ")} · {s.ok ? "OK" : "FAIL"}
          </p>
          {s.file ? (
            <p className="mt-1 truncate font-mono text-[10px] text-slate-500">{s.file}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
