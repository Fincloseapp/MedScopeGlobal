import type { Metadata } from "next";
import Link from "next/link";
import { V20StudyCard } from "@/components/v20/study-card";
import { getV20StudiesList } from "@/lib/v20/studies/query";
import { V20_STUDY_SOURCES } from "@/lib/v20/studies/sources";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Studie — MedScopeGlobal",
    description:
      "Revmatologické a klinické studie v češtině — PubMed, ClinicalTrials.gov, EULAR, SÚKL, WHO, NZIP. Každý souhrn s DOI nebo PMID.",
    path: "/studie",
  });
}

export default async function StudiePage() {
  const studies = await getV20StudiesList(12);

  return (
    <div className="v20-studies-page mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">Výzkum</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-[#021d33]">Studie — revmatologie</h1>
      <p className="mt-3 max-w-3xl text-slate-600">
        Profesionální české shrnutí klinických studií. Každá publikace obsahuje souhrn, metodiku,
        výsledky, závěr, klinický dopad a ověřitelné identifikátory{" "}
        <strong className="font-semibold text-[#021d33]">DOI</strong> nebo{" "}
        <strong className="font-semibold text-[#021d33]">PubMed ID (PMID)</strong> odkazující na
        primární zdroj.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {["DOI", "PMID", "CONSORT", "PRISMA"].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 font-semibold text-primary"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link href="/studie/nejnovejsi" className="rounded-full bg-primary px-3 py-1 text-white">
          Nejnovější
        </Link>
        <Link
          href="/studie/archiv"
          className="rounded-full border border-slate-200 px-3 py-1 text-primary"
        >
          Archiv
        </Link>
      </div>

      {studies.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((s) => (
            <V20StudyCard key={s.id} study={s} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
          <p className="font-semibold text-[#021d33]">Kurátorované studie se načítají</p>
          <p className="mt-2">
            Generické placeholdery byly odstraněny. Zobrazujeme pouze ověřené souhrny s DOI/PMID.
          </p>
        </div>
      )}

      <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        <p className="font-semibold text-[#021d33]">Monitorované zdroje (v20.2)</p>
        <p className="mt-2">{V20_STUDY_SOURCES.map((s) => s.name).join(" · ")}</p>
        <p className="mt-3 text-xs text-slate-500">
          Redakční standard: peer review kontrola, typ studie (RCT, meta-analýza, kohortová), metodika
          dle CONSORT/PRISMA a odkaz na primární publikaci přes DOI nebo PMID.
        </p>
      </div>
    </div>
  );
}
