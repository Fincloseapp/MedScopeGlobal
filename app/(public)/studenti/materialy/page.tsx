import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { StudentMaterialsBrowser } from "@/components/studenti/materials-browser";
import {
  computeMaterialsStats,
  listStudentMaterialSubjects,
  listStudentMaterials,
} from "@/lib/studenti/materials";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 3600;

export const metadata: Metadata = buildV20PageMetadata({
  title: "Studijní materiály LF1 — kurátorovaný index | MedScopeGlobal",
  description:
    "Přehled studijních materiálů z LF1.CZ podle ročníku a oboru. MedScopeGlobal kurátoruje metadata a odkazuje na originály u zdroje.",
  path: "/studenti/materialy",
});

export default async function StudentiMaterialyPage() {
  const [{ materials }, subjects] = await Promise.all([
    listStudentMaterials({ limit: 1000 }),
    listStudentMaterialSubjects(),
  ]);
  const stats = computeMaterialsStats(materials);

  return (
    <ModulePageShell
      eyebrow="Pro studenty"
      title="Studijní materiály LF1"
      description="Kurátorovaný index materiálů z portálu LF1.CZ — vyhledávání podle ročníku, oboru a názvu. Soubory zůstávají u originálního zdroje."
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

      <StudentMaterialsBrowser materials={materials} subjects={subjects} stats={stats} />
    </ModulePageShell>
  );
}
