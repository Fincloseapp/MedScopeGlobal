import Link from "next/link";
import type { DrugNewsRow } from "@/lib/queries/v4c/drug-news";
import { DrugNewsListCard } from "@/components/v4c/drug-news-list-card";

export function DrugSourceListing({
  backHref,
  backLabel,
  eyebrow,
  title,
  description,
  items,
}: {
  backHref: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  items: DrugNewsRow[];
}) {
  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href={backHref} className="text-sm font-medium text-[#005B96] hover:underline">
          ← {backLabel}
        </Link>
        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33]">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-slate-600">{description}</p>
        ) : null}

        <div className="mt-10 grid gap-4">
          {items.length ? (
            items.map((item) => <DrugNewsListCard key={item.id} item={item} />)
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Zatím žádné záznamy z tohoto zdroje.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
