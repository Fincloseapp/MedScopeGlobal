import Link from "next/link";
import { DRUG_STATUS_LABELS } from "@/lib/v4c/drug-sources";
import type { DrugNewsRow } from "@/lib/queries/v4c/drug-news";

function formatCsDate(iso: string | null) {
  if (!iso) return "";
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

type DrugNewsListCardProps = {
  item: DrugNewsRow;
  /** Text-only layout without module images — summary shown prominently. */
  variant?: "default" | "text-only";
};

export function DrugNewsListCard({ item, variant = "default" }: DrugNewsListCardProps) {
  const meta = [item.agency?.toUpperCase(), item.drug_name, formatCsDate(item.published_date)]
    .filter(Boolean)
    .join(" · ");

  const isTextOnly = variant === "text-only";

  return (
    <Link
      href={`/leky/novinky/${item.slug}`}
      prefetch
      className="group block rounded-2xl border border-[#cfe1f3] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#005B96]/40 hover:shadow-md"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#005B96]">
        {DRUG_STATUS_LABELS[item.status] ?? item.status}
      </span>
      <h3
        className={`font-display font-semibold text-[#021d33] group-hover:text-[#005B96] ${
          isTextOnly ? "mt-2 text-lg leading-snug" : "mt-1 text-lg"
        }`}
      >
        {item.title}
      </h3>
      {meta ? <p className="mt-1 text-xs text-slate-500">{meta}</p> : null}
      {item.summary ? (
        <p
          className={`line-clamp-4 leading-relaxed text-slate-600 ${
            isTextOnly ? "mt-4 text-[15px]" : "mt-3 text-sm"
          }`}
        >
          {item.summary}
        </p>
      ) : null}
    </Link>
  );
}
