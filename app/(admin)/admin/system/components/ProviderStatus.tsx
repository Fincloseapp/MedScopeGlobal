import type { V25ProviderStatus } from "@/lib/v25/types";

export function ProviderStatus({ providers }: { providers: V25ProviderStatus[] }) {
  if (!providers.length) {
    return <p className="text-sm text-muted-foreground">Žádní provideři zatím neběželi.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-slate-50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Provider</th>
            <th className="px-4 py-3 font-medium">Poslední běh</th>
            <th className="px-4 py-3 font-medium">Nové položky</th>
            <th className="px-4 py-3 font-medium">Aktualizace</th>
            <th className="px-4 py-3 font-medium">Chyby</th>
            <th className="px-4 py-3 font-medium">Stav</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => (
            <tr key={p.id} className="border-b last:border-0">
              <td className="px-4 py-3 font-medium">{p.name}</td>
              <td className="px-4 py-3">{new Date(p.lastRunAt).toLocaleString("cs-CZ")}</td>
              <td className="px-4 py-3">{p.newItems}</td>
              <td className="px-4 py-3">{p.updates}</td>
              <td className="px-4 py-3 text-red-600">{p.errors}</td>
              <td className="px-4 py-3 uppercase">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
