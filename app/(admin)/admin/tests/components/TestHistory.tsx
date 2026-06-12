import type { V25TestRunRecord } from "@/lib/v25/types";
import { cn } from "@/lib/utils";

export function TestHistory({ runs }: { runs: V25TestRunRecord[] }) {
  if (!runs.length) {
    return (
      <p className="text-sm text-muted-foreground">Historie běhů je prázdná.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-slate-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Čas</th>
            <th className="px-4 py-3 font-medium">Režim</th>
            <th className="px-4 py-3 font-medium">Výsledek</th>
            <th className="px-4 py-3 font-medium">Prošlo</th>
            <th className="px-4 py-3 font-medium">Délka</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => {
            const passed = run.cases.filter((c) => c.ok).length;
            return (
              <tr key={run.id} className="border-b last:border-0">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(run.at).toLocaleString("cs-CZ")}
                </td>
                <td className="px-4 py-3 uppercase">{run.mode}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase",
                      run.ok ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                    )}
                  >
                    {run.ok ? "pass" : "fail"}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {passed}/{run.cases.length}
                </td>
                <td className="px-4 py-3 tabular-nums">{run.durationMs} ms</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
