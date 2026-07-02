import Link from "next/link";
import { DrugNewsListCard } from "@/components/v4c/drug-news-list-card";
import { DrugSourceAttribution } from "@/components/v4c/drug-source-attribution";
import type { DrugNewsRow } from "@/lib/queries/v4c/drug-news";

export function DrugSourceListing({
  backHref,
  backLabel,
  eyebrow,
  title,
  description,
  items,
  emptyMessage = "Obsah se načítá z oficiálních zdrojů…",
}: {
  backHref: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  items: DrugNewsRow[];
  emptyMessage?: string;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link href={backHref} className="text-sm font-medium text-[#005B96] hover:underline">
        ← {backLabel}
      </Link>

      <header className="mt-4 border-b border-slate-200 pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          medscopeglobal.com · {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33]">{title}</h1>
        <p className="mt-3 max-w-2xl text-slate-600">{description}</p>
      </header>

      {items.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <DrugNewsListCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          {emptyMessage}
        </p>
      )}

      <DrugSourceAttribution className="mt-10" />
    </div>
  );
}
