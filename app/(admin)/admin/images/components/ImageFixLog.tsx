type FixEntry = {
  id: string;
  at: string;
  section: string;
  slug: string;
  action: string;
  result: string;
  detail?: string;
};

type Props = {
  entries: FixEntry[];
};

export function ImageFixLog({ entries }: Props) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="font-semibold text-[#021d33]">Log oprav obrázků</h3>
      <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
        {entries.length === 0 ? (
          <li className="text-muted-foreground">Žádné opravy</li>
        ) : (
          entries.map((e) => (
            <li key={e.id} className="rounded-lg border px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">
                  {e.section}/{e.slug}
                </span>
                <span
                  className={`text-xs font-medium ${e.result === "ok" ? "text-emerald-700" : "text-red-700"}`}
                >
                  {e.result.toUpperCase()}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {e.action} · {new Date(e.at).toLocaleString("cs-CZ")}
              </p>
              {e.detail ? <p className="mt-1 truncate text-xs">{e.detail}</p> : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
