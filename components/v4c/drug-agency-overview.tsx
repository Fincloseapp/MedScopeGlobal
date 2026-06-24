import type { DrugNewsRow } from "@/lib/queries/v4c/drug-news";

const AGENCY_LABELS: Record<string, string> = {
  ema: "EMA",
  fda: "FDA",
  sukl: "SÚKL",
  ostatní: "Ostatní",
};

export function DrugAgencyOverview({
  byAgency,
}: {
  byAgency: Record<string, DrugNewsRow[]>;
}) {
  const entries = Object.entries(byAgency);
  if (!entries.length) return null;

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {entries.map(([agency, items]) => (
        <div
          key={agency}
          className="rounded-2xl border border-slate-200 bg-white p-4"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {AGENCY_LABELS[agency] ?? agency}
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-[#021d33]">
            {items.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">aktivních záznamů</p>
        </div>
      ))}
    </section>
  );
}
