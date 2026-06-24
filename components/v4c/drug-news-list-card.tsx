import Link from "next/link";
import type { DrugNewsRow } from "@/lib/queries/v4c/drug-news";

export function DrugNewsListCard({
  item,
  variant = "default",
}: {
  item: DrugNewsRow;
  variant?: "default" | "text-only";
}) {
  const href = `/leky/novinky/${item.slug}`;
  const meta = [item.agency?.toUpperCase(), item.status].filter(Boolean).join(" · ");

  return (
    <Link
      href={href}
      className="block rounded-2xl border border-[#cfe1f3] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {meta ? (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#005B96]">
          {meta}
        </span>
      ) : null}
      <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33]">
        {item.title}
      </h3>
      {item.drug_name ? (
        <p className="mt-1 text-xs text-slate-500">{item.drug_name}</p>
      ) : null}
      {variant !== "text-only" && item.summary ? (
        <p className="mt-2 text-sm text-slate-600 line-clamp-3">{item.summary}</p>
      ) : null}
    </Link>
  );
}
