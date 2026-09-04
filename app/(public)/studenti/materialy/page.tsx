import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  StudentAtelierShell,
  atelierGhostLink,
  atelierPrimaryLink,
} from "@/components/studenti/student-atelier-shell";
import { StudentMaterialsBrowser } from "@/components/studenti/materials-browser";
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
    <StudentAtelierShell
      current="/studenti/materialy"
      kicker="Ateliér · Materiály"
      title="Studijní materiály"
      lead="Kurátorovaná knihovna studijních materiálů — vyhledávání podle ročníku, oboru a názvu. Materiály lze číst online v prohlížeči."
      actions={
        <Link href="/studenti" className={atelierGhostLink()}>
          Zpět na studentskou sekci
        </Link>
      }
    >
      <StudentMaterialsBrowser materials={listItems} subjects={subjects} stats={stats} />

      <section className="mt-10 border-t border-[#1b1712]/10 pt-8">
        <h2 className="font-display text-lg font-semibold text-[#1b1712]">
          Potřebujete víc než ochutnávku?
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5c564c]">
          Free vrstva stačí na orientaci. Studentské předplatné odemyká AI tutor a celou Academy —
          1 test zdarma, první měsíc 89 Kč, další 149 Kč.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/predplatne#student" data-cta="materialy-student" className={atelierPrimaryLink()}>
            89 Kč první měsíc
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/studenti/ai-tutor" data-cta="materialy-ai-tutor" className={atelierGhostLink()}>
            AI tutor
          </Link>
        </div>
      </section>
    </StudentAtelierShell>
  );
}
