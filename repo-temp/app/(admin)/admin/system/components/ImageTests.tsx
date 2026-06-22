import type { V25ImageTestReport, V25TestStatus } from "@/lib/v25/types";

export function ImageTests({
  status,
  report,
}: {
  status: V25TestStatus;
  report?: V25ImageTestReport | null;
}) {
  if (!report) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-muted-foreground">
        Image-test zatím neběžel. Spusťte testy tlačítkem výše.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border bg-white p-4 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase">
          {status}
        </span>
        <span>
          Registry: {report.registryTotal} · URL {report.urlsOk}/{report.urlsChecked} OK · Stránky{" "}
          {report.pagesOk}/{report.pagesChecked.length} OK
        </span>
        <span className="text-muted-foreground">{new Date(report.at).toLocaleString("cs-CZ")}</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <p className="text-xs text-muted-foreground">Asset API</p>
          <p className="font-medium">{report.assetApiOk ? "OK" : "Selhalo"}</p>
        </div>
        {report.assigned != null ? (
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Přiřazeno (pipeline)</p>
            <p className="font-medium">{report.assigned}</p>
          </div>
        ) : null}
        {report.missingBefore != null ? (
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Chybějící před během</p>
            <p className="font-medium">{report.missingBefore}</p>
          </div>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Stránky s vizuálem</p>
        <ul className="space-y-1 text-xs">
          {report.pagesChecked.map((p) => (
            <li key={p.path} className={p.ok ? "text-emerald-800" : "text-red-700"}>
              {p.ok ? "✓" : "✗"} {p.path} — {p.detail ?? (p.hasVisual ? "OK" : "bez obrázku")}
            </li>
          ))}
        </ul>
      </div>

      {report.urlsBroken.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Nefunkční URL obrázků</p>
          <ul className="max-h-36 list-inside list-disc overflow-y-auto text-xs text-red-700">
            {report.urlsBroken.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-muted-foreground">Všechny kontrolované URL obrázků odpovídají (bez 404).</p>
      )}
    </div>
  );
}
