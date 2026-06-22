import type { V25CronStatus } from "@/lib/v25/types";

export function CronStatus({ crons }: { crons: V25CronStatus[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-slate-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">CRON</th>
            <th className="px-4 py-3 font-medium">Poslední běh</th>
            <th className="px-4 py-3 font-medium">Délka</th>
            <th className="px-4 py-3 font-medium">Nové</th>
            <th className="px-4 py-3 font-medium">Aktualizace</th>
            <th className="px-4 py-3 font-medium">Chyby</th>
            <th className="px-4 py-3 font-medium">Stav</th>
          </tr>
        </thead>
        <tbody>
          {crons.map((c) => (
            <tr key={c.cronId} className="border-b last:border-0">
              <td className="px-4 py-3 font-mono text-xs">{c.cronId}</td>
              <td className="px-4 py-3">
                {c.lastRunAt ? new Date(c.lastRunAt).toLocaleString("cs-CZ") : "—"}
              </td>
              <td className="px-4 py-3">{c.durationMs != null ? `${c.durationMs} ms` : "—"}</td>
              <td className="px-4 py-3">
                {c.metrics?.newArticles ?? c.metrics?.generated ?? "—"}
              </td>
              <td className="px-4 py-3">{c.metrics?.updates ?? "—"}</td>
              <td className="px-4 py-3 text-red-600">
                {c.metrics?.failed != null ? c.metrics.failed : c.error ? 1 : 0}
              </td>
              <td className="px-4 py-3 uppercase">{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
