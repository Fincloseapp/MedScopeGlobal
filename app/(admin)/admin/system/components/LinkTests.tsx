import type { V25LinkTestReport, V25NavStatus, V25TestStatus } from "@/lib/v25/types";

export function LinkTests({
  status,
  navigation,
  report,
}: {
  status: V25TestStatus;
  navigation: V25NavStatus;
  report?: V25LinkTestReport | null;
}) {
  const total = report?.total ?? navigation.totalLinks;
  const working = report?.working ?? navigation.working;
  const broken = report?.broken ?? navigation.broken;
  const brokenUrls = report?.brokenUrls ?? navigation.brokenUrls;
  const at = report?.at ?? navigation.lastCheckAt;

  return (
    <div className="space-y-3 rounded-xl border bg-white p-4 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase">
          {status}
        </span>
        <span>
          {working}/{total} OK · {broken} nefunkčních
        </span>
        <span className="text-muted-foreground">{new Date(at).toLocaleString("cs-CZ")}</span>
      </div>
      {brokenUrls.length > 0 ? (
        <ul className="max-h-48 list-inside list-disc overflow-y-auto text-xs text-red-700">
          {brokenUrls.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">Link-test — žádné rozbité odkazy.</p>
      )}
    </div>
  );
}
