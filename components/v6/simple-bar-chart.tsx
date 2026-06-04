export function SimpleBarChart({
  data,
  maxHeight = 120,
}: {
  data: { label: string; value: number; color?: string }[];
  maxHeight?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-3 h-36 pt-4">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-medium text-slate-600">{d.value}</span>
          <div
            className="w-full max-w-[48px] rounded-t-md transition-all"
            style={{
              height: `${Math.round((d.value / max) * maxHeight)}px`,
              backgroundColor: d.color ?? "#005B96",
            }}
          />
          <span className="text-[10px] uppercase tracking-wide text-slate-500 text-center">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}
