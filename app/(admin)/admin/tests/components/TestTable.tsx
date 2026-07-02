import type { V25TestCaseResult } from "@/lib/v25/types";
import { cn } from "@/lib/utils";

function statusBadge(ok: boolean) {
  return ok
    ? "bg-emerald-100 text-emerald-800"
    : "bg-red-100 text-red-800";
}

export function TestTable({ cases }: { cases: V25TestCaseResult[] }) {
  if (!cases.length) {
    return (
      <p className="rounded-xl border bg-white p-4 text-sm text-muted-foreground">
        Zatím žádné výsledky. Spusťte test suite tlačítkem níže.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-slate-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Test</th>
            <th className="px-4 py-3 font-medium">Stav</th>
            <th className="px-4 py-3 font-medium">Detail</th>
            <th className="px-4 py-3 font-medium">Délka</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id} className="border-b last:border-0">
              <td className="px-4 py-3 font-medium">{c.label}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase",
                    statusBadge(c.ok)
                  )}
                >
                  {c.ok ? "ok" : "fail"}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {c.detail ?? "—"}
                {c.broken?.length ? (
                  <ul className="mt-1 list-inside list-disc text-red-700">
                    {c.broken.slice(0, 5).map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </td>
              <td className="px-4 py-3 tabular-nums">
                {c.durationMs != null ? `${c.durationMs} ms` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
