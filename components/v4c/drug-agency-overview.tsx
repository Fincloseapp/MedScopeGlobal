import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  DRUG_AGENCY_META,
  DRUG_MONITOR_SOURCES,
  DRUG_STATUS_LABELS,
  type DrugAgencyId,
} from "@/lib/v4c/drug-sources";
import type { DrugNewsRow } from "@/lib/queries/v4c/drug-news";

function formatCsDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function DrugAgencyOverview({ byAgency }: { byAgency: Record<DrugAgencyId, DrugNewsRow[]> }) {
  const agencies: DrugAgencyId[] = ["sukl", "ema", "fda"];

  return (
    <div className="mb-10 grid gap-4 lg:grid-cols-3">
      {agencies.map((agency) => {
        const meta = DRUG_AGENCY_META[agency];
        const sources = DRUG_MONITOR_SOURCES.filter((s) => s.agency === agency);
        const items = byAgency[agency] ?? [];

        return (
          <div
            key={agency}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            style={{ borderTopColor: meta.color, borderTopWidth: 3 }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {meta.region}
                </p>
                <h3 className="font-display text-lg font-semibold text-[#021d33]">{meta.short}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{meta.name}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {items.length} novinek
              </span>
            </div>

            <ul className="mt-4 space-y-2">
              {items.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/leky/novinky/${item.slug}`}
                    className="group block rounded-lg px-1 py-1 hover:bg-slate-50"
                  >
                    <p className="line-clamp-2 text-sm font-medium text-[#021d33] group-hover:text-[#005B96]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {DRUG_STATUS_LABELS[item.status] ?? item.status} · {formatCsDate(item.published_date)}
                    </p>
                  </Link>
                </li>
              ))}
              {!items.length ? (
                <li className="text-sm text-slate-500">Načítáme z oficiálních zdrojů…</li>
              ) : null}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              {sources.map((src) => (
                <a
                  key={src.id}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] text-slate-500 hover:border-[#005B96]/30 hover:text-[#005B96]"
                >
                  {src.labelCs}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
