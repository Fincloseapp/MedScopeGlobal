import Link from "next/link";
import { DrugNewsListCard } from "@/components/v4c/drug-news-list-card";
import { DrugSourceAttribution } from "@/components/v4c/drug-source-attribution";
import type { DrugNewsRow } from "@/lib/queries/v4c/drug-news";
import {
  DRUG_AGENCY_META,
  getDrugSourcesForAgency,
  type DrugAgencyId,
} from "@/lib/v4c/drug-sources";

export function DrugAgencyHub({
  agency,
  previewItems,
}: {
  agency: DrugAgencyId;
  previewItems: DrugNewsRow[];
}) {
  const meta = DRUG_AGENCY_META[agency];
  const sources = getDrugSourcesForAgency(agency);

  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <section
        className="px-4 py-12 sm:px-6"
        style={{
          background: `linear-gradient(135deg, ${meta.color}22 0%, #f4f8fc 70%)`,
        }}
      >
        <div className="mx-auto max-w-4xl">
          <Link href="/leky" className="text-sm font-medium text-[#005B96] hover:underline">
            ← Léky a farmakoterapie
          </Link>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            medscopeglobal.com · {meta.region}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33] sm:text-4xl">
            {meta.short} — {meta.name}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Interní přehled sekcí napojených na oficiální zdroje {meta.short}. Obsah se průběžně
            synchronizuje a zobrazuje v češtině.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {sources.map((src) => (
            <Link
              key={src.id}
              href={src.internalPath}
              className="rounded-2xl border border-[#cfe1f3] bg-white p-5 transition hover:border-[#005B96]/40 hover:shadow-md"
            >
              <h2 className="font-display text-lg font-semibold text-[#021d33]">{src.labelCs}</h2>
              {src.descriptionCs ? (
                <p className="mt-2 text-sm text-slate-600">{src.descriptionCs}</p>
              ) : null}
              <span className="mt-3 inline-block text-sm font-medium text-[#005B96]">
                Otevřít sekci →
              </span>
            </Link>
          ))}
        </div>

        {previewItems.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold text-[#021d33]">Nejnovější</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {previewItems.map((item) => (
                <DrugNewsListCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        <DrugSourceAttribution className="mt-10" />
      </div>
    </div>
  );
}
