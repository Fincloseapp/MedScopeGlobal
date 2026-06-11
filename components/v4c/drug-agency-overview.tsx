import Link from "next/link";
import {
  DRUG_AGENCY_HUB,
  DRUG_AGENCY_META,
  DRUG_MONITOR_SOURCES,
  DRUG_STATUS_LABELS,
  type DrugAgencyId,
} from "@/lib/v4c/drug-sources";
import type { DrugNewsRow } from "@/lib/queries/v4c/drug-news";

function formatCsDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function DrugAgencyOverview({
  byAgency,
}: {
  byAgency: Record<DrugAgencyId, DrugNewsRow[]>;
}) {
  const agencies: DrugAgencyId[] = ["sukl", "ema", "fda"];

  return (
    <section className="rounded-2xl border border-[#cfe1f3] bg-white p-6 shadow-sm">
      <h2 className="font-display text-xl font-bold text-[#021d33]">Oficiální zdroje</h2>
      <p className="mt-1 text-sm text-slate-500">
        Procházejte sekce přímo na MedScopeGlobal — bez opuštění portálu.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {agencies.map((agency) => {
          const meta = DRUG_AGENCY_META[agency];
          const sources = DRUG_MONITOR_SOURCES.filter((s) => s.agency === agency);
          const items = byAgency[agency] ?? [];

          return (
            <div
              key={agency}
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
              style={{ borderTopColor: meta.color, borderTopWidth: 3 }}
            >
              <div className="flex items-start justify-between gap-2">
                <Link href={DRUG_AGENCY_HUB[agency]} className="group inline-flex items-center gap-2">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: meta.color }}
                  >
                    {meta.short.slice(0, 2)}
                  </span>
                  <div>
                    <p className="font-semibold text-[#021d33] group-hover:text-[#005B96]">
                      {meta.short}
                    </p>
                    <p className="text-[10px] text-slate-400">{meta.region}</p>
                  </div>
                </Link>
                {items.length > 0 ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {items.length} novinek
                  </span>
                ) : null}
              </div>

              <ul className="mt-3 space-y-1.5">
                {sources.map((src) => (
                  <li key={src.id}>
                    <Link
                      href={src.internalPath}
                      className="text-sm text-slate-600 transition hover:text-[#005B96] hover:underline"
                    >
                      {src.labelCs}
                    </Link>
                  </li>
                ))}
              </ul>

              {items.length > 0 ? (
                <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                  {items.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/leky/novinky/${item.slug}`}
                        className="group block rounded-lg px-1 py-1 hover:bg-white/80"
                      >
                        <p className="line-clamp-2 text-sm font-medium text-[#021d33] group-hover:text-[#005B96]">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {DRUG_STATUS_LABELS[item.status] ?? item.status} ·{" "}
                          {formatCsDate(item.published_date)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-500">
                  Načítáme z oficiálních zdrojů…
                </p>
              )}

              <div className="mt-4 border-t border-slate-100 pt-3">
                <Link
                  href={DRUG_AGENCY_HUB[agency]}
                  className="text-sm font-medium text-[#005B96] hover:underline"
                >
                  Zobrazit vše →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
