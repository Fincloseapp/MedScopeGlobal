import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getStudyCollaborations } from "@/lib/queries/study-collaborations";

export const metadata: Metadata = {
  title: "Studijní spolupráce",
  description: "Nabídky spolupráce na klinických a výzkumných studiích.",
};

export default async function StudijniSpolupracePage() {
  const studies = await getStudyCollaborations();

  return (
    <ModulePageShell
      eyebrow="Výzkum"
      title="Spolupráce na studiích"
      description="Přehled výzev k účasti ve studiích a možnost přidat vlastní nabídku (organizace)."
      ctaHref="/studijni-spoluprace/pridat"
      ctaLabel="Přidat studii"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {studies.length === 0 ? (
          <p className="col-span-2 text-sm text-slate-600">
            Zatím žádné publikované nabídky.{" "}
            <Link href="/studijni-spoluprace/pridat" className="font-semibold text-[#005B96]">
              Přidat studii
            </Link>
          </p>
        ) : (
          studies.map((s) => (
            <Link
              key={s.id}
              href={`/studijni-spoluprace/${s.slug}`}
              className="rounded-2xl border border-[#cfe1f3] bg-white p-5 hover:shadow-md"
            >
              <p className="text-[10px] uppercase tracking-wider text-[#005B96]">{s.organization}</p>
              <h3 className="mt-1 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600 line-clamp-2">{s.summary}</p>
            </Link>
          ))
        )}
      </div>
    </ModulePageShell>
  );
}
