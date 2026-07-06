import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { MaterialTextReader } from "@/components/studenti/material-text-reader";
import { getCachedMaterialText } from "@/lib/studenti/material-text";
import { getStudentMaterialById, toPublicMaterial } from "@/lib/studenti/materials";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 3600;
export const maxDuration = 120;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const material = await getStudentMaterialById(id);
  if (!material) {
    return buildV20PageMetadata({
      title: "Materiál nenalezen | MedScopeGlobal",
      description: "Studijní materiál nebyl nalezen.",
      path: "/studenti/materialy",
    });
  }
  const pub = toPublicMaterial(material);
  return buildV20PageMetadata({
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
    <ModulePageShell
      eyebrow="Pro studenty"
      title="Studijní materiály"
      description="Čtení studijních materiálů — textový režim pro pohodlné studium."
      ctaHref="/studenti/materialy"
      ctaLabel="Zpět na přehled"
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
        <Link href="/studenti/materialy" className="hover:text-foreground">
          Studijní materiály
        </Link>
        <span className="mx-2">/</span>
        <span className="line-clamp-1">{pub.display_title}</span>
      </nav>

      <MaterialTextReader material={pub} content={content} />
    </ModulePageShell>
  );
}
