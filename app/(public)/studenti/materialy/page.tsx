import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { StudentMaterialsBrowser } from "@/components/studenti/materials-browser";
import { Button } from "@/components/ui/button";
import {
  computeMaterialsStats,
  listStudentMaterialSubjects,
  listStudentMaterials,
  toListMaterial,
} from "@/lib/studenti/materials";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
  title: "Studijní materiály | MedScopeGlobal",
  description:
    "Kurátorovaná knihovna studijních materiálů pro studenty medicíny — vyhledávání podle ročníku, oboru a názvu. Čtení online v prohlížeči.",
  path: "/studenti/materialy",
});
}

export default async function StudentiMaterialyPage() {
  const [{ materials, total }, subjects] = await Promise.all([
    listStudentMaterials({ limit: 1000 }),
    listStudentMaterialSubjects(),
  ]);
  const listItems = materials.map(toListMaterial);
  const stats = computeMaterialsStats(listItems, total);

  return (
    <ModulePageShell
      eyebrow="Pro studenty"
      title="Studijní materiály"
      description="Kurátorovaná knihovna studijních materiálů — vyhledávání podle ročníku, oboru a názvu. Materiály lze číst online v prohlížeči."
      ctaHref="/studenti"
      ctaLabel="Zpět na studentskou sekci"
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Domů
        </Link>
        <span className="mx-2">/</span>
        <Link href="/studenti" className="hover:text-foreground">
          Studenti
        </Link>
        <span className="mx-2">/</span>
        <span>Studijní materiály</span>
      </nav>

      <StudentMaterialsBrowser materials={listItems} subjects={subjects} stats={stats} />

      <section className="mt-10 rounded-2xl border border-[#cfe1f3] bg-[#f0f7ff]/70 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-[#021d33]">
          Potřebujete víc než ochutnávku?
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Free vrstva stačí na orientaci. Studentské předplatné odemyká AI tutor a celou Academy —
          vhodné při pravidelném opakování během semestru.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild className="rounded-full bg-[#005B96]">
            <Link
              href="/predplatne#student"
              data-cta="materialy-student"
            >
              89 Kč první měsíc
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/studenti/ai-tutor" data-cta="materialy-ai-tutor">
              AI tutor
            </Link>
          </Button>
        </div>
      </section>
    </ModulePageShell>
  );
}
