"use client";

export function AdStats({
  stats,
}: {
  stats: {
    total: number;
    active: number;
    impressions: number;
    clicks: number;
    ctr: number;
  };
}) {
  const cards = [
    { label: "Reklamy celkem", value: stats.total },
    { label: "Aktivní", value: stats.active },
    { label: "Imprese", value: stats.impressions.toLocaleString("cs-CZ") },
    { label: "Kliky", value: stats.clicks.toLocaleString("cs-CZ") },
    { label: "CTR", value: `${stats.ctr.toFixed(2)} %` },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-[#021d33]">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
