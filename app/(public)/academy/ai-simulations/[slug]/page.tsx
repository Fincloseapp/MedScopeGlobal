import Link from "next/link";
import { notFound } from "next/navigation";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { SimulationPlayer, type SimulationScenario } from "@/components/academy/SimulationPlayer";
import { getSimulationBySlug } from "@/lib/academy/db";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const sim = await getSimulationBySlug(slug);
  if (!sim) {
    return buildV20PageMetadata({
      title: "Simulace nenalezena",
      description: "Požadovaná klinická simulace nebyla nalezena.",
      path: `/academy/ai-simulations/${slug}`,
    });
  }
  return buildV20PageMetadata({
    title: `${sim.title} — AI simulace`,
    description: `Klinická simulace · obtížnost ${sim.difficulty}`,
    path: `/academy/ai-simulations/${slug}`,
  });
}

export default async function AcademySimulationDetailPage({ params }: Props) {
  const { slug } = await params;
  const sim = await getSimulationBySlug(slug);
  if (!sim) notFound();

  const scenario = (sim.scenario_json ?? {}) as SimulationScenario;

  return (
    <>
      <AcademyPageHeader
        eyebrow="AI simulace"
        title={sim.title}
        description="Interaktivní klinický scénář s okamžitou zpětnou vazbou."
        ctaHref="/academy/ai-simulations"
        ctaLabel="Zpět na simulace"
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/academy" className="hover:text-foreground">
            Academy
          </Link>
          <span className="mx-2">/</span>
          <Link href="/academy/ai-simulations" className="hover:text-foreground">
            Simulace
          </Link>
          <span className="mx-2">/</span>
          <span>{sim.title}</span>
        </nav>
        <SimulationPlayer title={sim.title} difficulty={sim.difficulty} scenario={scenario} />
      </div>
    </>
  );
}
