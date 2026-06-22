const DX_LABELS: Record<string, string> = {
  ra: "RA",
  psa: "PsA",
  as: "AS",
  oa: "OA",
};

export function DiagnosisHeatmap({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  if (!entries.length) {
    return <p className="text-sm text-slate-500">Zatím bez dat — spusťte autopilot cron.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {entries.map(([key, value]) => {
        const intensity = 0.25 + (value / max) * 0.75;
        return (
          <div
            key={key}
            className="rounded-lg border border-[#d9e8f4] p-3 text-center"
            style={{ backgroundColor: `rgba(0, 91, 150, ${intensity})` }}
          >
            <p className="text-lg font-bold text-white">{DX_LABELS[key] ?? key}</p>
            <p className="text-xs text-white/90">{value} článků</p>
          </div>
        );
      })}
    </div>
  );
}
