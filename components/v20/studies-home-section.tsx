import Link from "next/link";
import { V20StudyCard } from "@/components/v20/study-card";
import { getV20LatestStudies } from "@/lib/v20/studies/query";

export async function V20StudiesHomeSection() {
  const studies = await getV20LatestStudies(4);
  if (!studies.length) return null;

  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              Výzkum
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-[#021d33]">
              Nejnovější medicínské studie
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Profesionální české shrnutí z PubMed, EULAR, ClinicalTrials.gov, SÚKL a dalších
              zdrojů.
            </p>
          </div>
          <Link href="/studie" className="text-sm font-medium text-primary hover:underline">
            Všechny studie →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {studies.map((study) => (
            <V20StudyCard key={study.id} study={study} />
          ))}
        </div>
      </div>
    </section>
  );
}
