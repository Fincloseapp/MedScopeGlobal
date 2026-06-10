import Link from "next/link";
import type { V25SystemState } from "@/lib/v25/types";

export function UniversitySources({
  universities,
}: {
  universities: V25SystemState["universities"];
}) {
  const faculties = universities?.faculties ?? [];
  const totals = universities?.totals;

  if (!faculties.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Zatím nebyl spuštěn sběr z českých LF.{" "}
        <Link href="/studium/univerzity" className="text-primary underline">
          Veřejný přehled fakult
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {totals ? (
        <p className="text-sm text-muted-foreground">
          Poslední sběr:{" "}
          {universities?.at ? new Date(universities.at).toLocaleString("cs-CZ") : "—"} · OK{" "}
          {totals.ok}/{totals.fetched} · Nové články: {totals.newArticles} · Aktualizace:{" "}
          {totals.updates}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Fakulta</th>
              <th className="px-4 py-3 font-medium">Město</th>
              <th className="px-4 py-3 font-medium">Poslední sběr</th>
              <th className="px-4 py-3 font-medium">Nové</th>
              <th className="px-4 py-3 font-medium">Aktualizace</th>
              <th className="px-4 py-3 font-medium">Stav</th>
            </tr>
          </thead>
          <tbody>
            {faculties.map((f) => (
              <tr key={f.slug} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/studium/univerzity/${f.slug}`} className="font-medium text-primary hover:underline">
                    {f.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{f.city}</td>
                <td className="px-4 py-3">
                  {f.fetchedAt ? new Date(f.fetchedAt).toLocaleString("cs-CZ") : "—"}
                </td>
                <td className="px-4 py-3">{f.newArticles ?? 0}</td>
                <td className="px-4 py-3">{f.updates ?? 0}</td>
                <td className="px-4 py-3">{f.ok === false ? "FAIL" : f.ok ? "OK" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
