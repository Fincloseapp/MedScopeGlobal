import Link from "next/link";
import { Calendar } from "lucide-react";
import { buildDrugNewsArticle } from "@/lib/v4c/drug-content";
import { getDrugNewsBackLink } from "@/lib/v4c/drug-sources";
import { formatCsDate } from "@/lib/v21/enrich";
import type { DrugNewsRow } from "@/lib/queries/v4c/drug-news";

export function DrugNewsDetail({ drug }: { drug: DrugNewsRow }) {
  const dateLabel = formatCsDate(drug.published_date);
  const article = buildDrugNewsArticle(drug, dateLabel);
  const back = getDrugNewsBackLink(drug);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href={back.href} className="text-sm font-medium text-[#005B96] hover:underline">
        ← {back.label}
      </Link>

      <header className="mt-5 border-b border-slate-200 pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          medscopeglobal.com · Léky · {article.agencyLabel}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-[#021d33] sm:text-4xl">
          {article.title}
        </h1>
        {article.drugName ? (
          <p className="mt-2 text-lg text-slate-600">Přípravek: {article.drugName}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="rounded-full bg-[#005B96]/10 px-2.5 py-0.5 text-xs font-semibold text-[#005B96]">
            {article.statusLabel}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {article.dateLabel}
          </span>
        </div>
      </header>

      <div className="prose prose-slate mt-8 max-w-none">
        <p className="text-lg leading-relaxed text-[#021d33]">{article.lead}</p>
        {article.paragraphs.map((para) => (
          <p key={para.slice(0, 48)} className="mt-4 leading-relaxed text-slate-700">
            {para}
          </p>
        ))}
      </div>

      <footer className="mt-10 border-t border-slate-100 pt-4">
        <p className="text-[10px] leading-relaxed text-slate-400">
          Obsah zpracován a strukturován redakcí MedScopeGlobal.com pro českou odbornou praxi.
          Veřejný podklad: {article.agencyLabel}
          {drug.source_name && drug.source_name !== article.agencyLabel
            ? ` (${drug.source_name})`
            : ""}
          . Informace nenahrazují SPC ani lékařské posouzení.
        </p>
      </footer>
    </article>
  );
}
