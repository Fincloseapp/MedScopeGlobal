import type { V25FixRecord } from "@/lib/v25/types";

export function FixHistory({ history }: { history: V25FixRecord[] }) {
  const autofixes = history.filter((h) => h.action === "autofix");
  const rollbacks = history.filter((h) => h.action === "rollback");
  const redeploys = history.filter((h) => h.action === "redeploy");

  return (
    <div className="space-y-6">
      <HistorySection title="Auto-fix" rows={autofixes} />
      <HistorySection title="Rollback" rows={rollbacks} />
      <HistorySection title="Redeploy" rows={redeploys} />
    </div>
  );
}

function HistorySection({ title, rows }: { title: string; rows: V25FixRecord[] }) {
  if (rows.length === 0) {
    return (
      <div>
        <h3 className="mb-2 text-sm font-semibold text-[#021d33]">{title}</h3>
        <p className="text-sm text-muted-foreground">Zatím žádné záznamy.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-[#021d33]">{title}</h3>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Datum</th>
              <th className="px-4 py-3 font-medium">Typ chyby</th>
              <th className="px-4 py-3 font-medium">Modul</th>
              <th className="px-4 py-3 font-medium">Výsledek</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 15).map((h) => (
              <tr key={h.id} className="border-b last:border-0">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(h.at).toLocaleString("cs-CZ")}
                </td>
                <td className="px-4 py-3">{h.errorType}</td>
                <td className="px-4 py-3">{h.module}</td>
                <td className="px-4 py-3 uppercase">{h.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
