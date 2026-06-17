import { notFound } from "next/navigation";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { getSimulationBySlug } from "@/lib/academy/db";

type Props = { params: Promise<{ slug: string }> };

export default async function AcademySimulationDetailPage({ params }: Props) {
  const { slug } = await params;
  const simulation = await getSimulationBySlug(slug);
  if (!simulation) notFound();

  return (
    <>
      <AcademyPageHeader
        eyebrow="Simulace"
        title={simulation.title}
        description={`Obtížnost: ${simulation.difficulty}`}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <pre className="overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
          {JSON.stringify(simulation.scenario_json, null, 2)}
        </pre>
      </div>
    </>
  );
}
