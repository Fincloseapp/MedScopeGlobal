import type { V25NavStatus } from "@/lib/v25/types";

export function NavigationTests({ navigation }: { navigation: V25NavStatus }) {
  return (
    <div className="space-y-3 rounded-xl border bg-white p-4 text-sm">
      <div className="flex flex-wrap gap-4">
        <span>
          Celkem: <strong>{navigation.totalLinks}</strong>
        </span>
        <span>
          Funkční: <strong className="text-emerald-700">{navigation.working}</strong>
        </span>
        <span>
          Nefunkční: <strong className="text-red-600">{navigation.broken}</strong>
        </span>
        <span className="text-muted-foreground">
          Kontrola: {new Date(navigation.lastCheckAt).toLocaleString("cs-CZ")}
        </span>
      </div>
      {navigation.brokenUrls.length > 0 ? (
        <ul className="max-h-48 list-inside list-disc overflow-y-auto text-xs text-red-700">
          {navigation.brokenUrls.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">Navigace — všechny sledované odkazy fungují.</p>
      )}
    </div>
  );
}
