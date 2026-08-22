"use client";

import type { LabSeries } from "@/lib/medipacient/timelineEngine";

function formatDay(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("cs-CZ", { day: "numeric", month: "short" });
}

function polyline(points: LabSeries["points"], width: number, height: number): string {
  if (!points.length) return "";
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return points
    .map((p, i) => {
      const x = points.length === 1 ? width / 2 : (i / (points.length - 1)) * (width - 24) + 12;
      const y = height - 18 - ((p.value - min) / span) * (height - 36);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function LabGraphView({
  series,
  showPrediction = false,
}: {
  series: Array<LabSeries & { predicted?: number | null }>;
  showPrediction?: boolean;
}) {
  if (!series.length) {
    return (
      <p className="mt-4 rounded-2xl border-2 border-dashed border-slate-400 bg-white px-4 py-8 text-center text-lg leading-7 text-slate-800">
        Zatím tu nejsou laboratorní hodnoty. Po zpracování zprávy se tu objeví grafy (CRP, ALT a další).
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {series.map((item) => (
        <section key={item.name} className="rounded-2xl border-2 border-slate-300 bg-white p-4">
          <p className="text-base font-semibold uppercase tracking-wide text-[#2D7FF9]">{item.name}</p>
          <p className="mt-1 text-2xl font-semibold text-[#021d33]">
            {item.latest.value} {item.latest.unit}
          </p>
          <p className="text-lg text-slate-800">
            Trend: <strong>{item.trend}</strong>
            {item.points.length > 1 ? ` · ${item.points.length} měření` : ""}
          </p>
          {showPrediction && item.predicted != null ? (
            <p className="mt-1 text-base text-slate-700">
              Orientační odhad další hodnoty: {item.predicted.toFixed(2)} {item.unit}. Není to diagnóza.
            </p>
          ) : null}
          <svg viewBox="0 0 320 120" className="mt-3 h-32 w-full" role="img" aria-label={`Graf ${item.name}`}>
            <rect x="0" y="0" width="320" height="120" fill="#F5F7FA" />
            <polyline
              fill="none"
              stroke="#2D7FF9"
              strokeWidth="4"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={polyline(item.points, 320, 120)}
            />
            {item.points.map((point, i) => {
              const values = item.points.map((p) => p.value);
              const min = Math.min(...values);
              const max = Math.max(...values);
              const span = max - min || 1;
              const x = item.points.length === 1 ? 160 : (i / (item.points.length - 1)) * 296 + 12;
              const y = 102 - ((point.value - min) / span) * 84;
              return <circle key={`${item.name}-${point.dateIso}-${i}`} cx={x} cy={y} r="6" fill="#1B1F23" />;
            })}
          </svg>
          <p className="mt-1 text-base text-slate-700">
            {item.points.map((p) => formatDay(p.dateIso)).join(" → ")}
          </p>
        </section>
      ))}
    </div>
  );
}
