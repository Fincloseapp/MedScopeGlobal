import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StudentAtelierShell, atelierGhostLink } from "@/components/studenti/student-atelier-shell";
import { MaterialTextReader } from "@/components/studenti/material-text-reader";
import { getCachedMaterialText } from "@/lib/studenti/material-text";
import { getStudentMaterialById, toPublicMaterial } from "@/lib/studenti/materials";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 3600;
export const maxDuration = 120;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const material = await getStudentMaterialById(id);
  if (!material) {
    return await buildLocalizedV20PageMetadata({
      title: "Materiál nenalezen | MedScopeGlobal",
      description: "Studijní materiál nebyl nalezen.",
      path: "/studenti/materialy",
    });
  }
  const pub = toPublicMaterial(material);
  return await buildLocalizedV20PageMetadata({
    title: `${pub.display_title} | Studijní materiály | MedScopeGlobal`,
    description: `${pub.subject} — studijní materiál pro studenty medicíny.`,
    path: pub.read_path,
  });
}

export default async function MaterialReadPage({ params }: Props) {
  const { id } = await params;
  const material = await getStudentMaterialById(id);
  if (!material) notFound();

  const pub = toPublicMaterial(material);
  const content = await getCachedMaterialText(id);

  return (
    <StudentAtelierShell
      current="/studenti/materialy"
      kicker="Ateliér · Čtení"
      title={pub.display_title}
      lead={`${pub.subject} — textový režim pro pohodlné studium. Doplněk ke skriptům z fakulty.`}
      actions={
        <Link href="/studenti/materialy" className={atelierGhostLink()}>
          Zpět na přehled
        </Link>
      }
    >
      <MaterialTextReader material={pub} content={content} />
    </StudentAtelierShell>
  );
}
