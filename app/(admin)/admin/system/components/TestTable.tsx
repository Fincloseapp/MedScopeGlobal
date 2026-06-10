import type { V25ApiStatus, V25CronStatus } from "@/lib/v25/types";

export function CronTable({ crons }: { crons: V25CronStatus[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-slate-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">CRON</th>
            <th className="px-4 py-3 font-medium">Poslední běh</th>
            <th className="px-4 py-3 font-medium">Délka</th>
            <th className="px-4 py-3 font-medium">Stav</th>
            <th className="px-4 py-3 font-medium">Chyba</th>
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
              <td className="px-4 py-3 uppercase">{c.status}</td>
              <td className="px-4 py-3 text-xs text-red-600">{c.error ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ApiTable({ apis }: { apis: V25ApiStatus[] }) {
  const rows =
    apis.length > 0
      ? apis
      : [
          { path: "/api/v24/health", status: 0, ok: false },
          { path: "/api/v24/monitoring", status: 0, ok: false },
          { path: "/api/v25/health", status: 0, ok: false },
        ];

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-slate-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Endpoint</th>
            <th className="px-4 py-3 font-medium">HTTP</th>
            <th className="px-4 py-3 font-medium">Verze</th>
            <th className="px-4 py-3 font-medium">OK</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.path} className="border-b last:border-0">
              <td className="px-4 py-3 font-mono text-xs">{a.path}</td>
              <td className="px-4 py-3">{a.status || "—"}</td>
              <td className="px-4 py-3">{a.version ?? "—"}</td>
              <td className="px-4 py-3">{a.ok ? "✓" : "✗"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NavTable({
  navigation,
}: {
  navigation: { totalLinks: number; working: number; broken: number; brokenUrls: string[] };
}) {
  return (
    <div className="space-y-3 rounded-xl border bg-white p-4 text-sm">
      <p>
        Funkční: <strong>{navigation.working}</strong> / {navigation.totalLinks} · Nefunkční:{" "}
        <strong className="text-red-600">{navigation.broken}</strong>
      </p>
      {navigation.brokenUrls.length > 0 ? (
        <ul className="max-h-40 list-inside list-disc overflow-y-auto text-xs text-red-700">
          {navigation.brokenUrls.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">Žádné nefunkční odkazy.</p>
      )}
    </div>
  );
}
