import { notFound } from "next/navigation";

import { AcademyPageHeader } from "@/components/academy/page-header";
import { SimulationPlayer, type SimulationScenario } from "@/components/academy/simulation-player";
import { getSimulationBySlug } from "@/lib/academy/db";

type Props = { params: Promise<{ slug: string }> };

export default async function AcademySimulationDetailPage({ params }: Props) {
  const { slug } = await params;
  const simulation = await getSimulationBySlug(slug);
  if (!simulation) notFound();

  const scenario = (simulation.scenario_json ?? {}) as SimulationScenario;
  const vitals = scenario.vitals ?? {};

  return (
    <>
      <AcademyPageHeader
        eyebrow="Klinická simulace"
        title={simulation.title}
        description={`Obtížnost: ${simulation.difficulty}`}
      />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
        {scenario.chief_complaint ? (
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Hlavní symptom</p>
            <p className="mt-2 text-lg text-[#021d33]">{scenario.chief_complaint}</p>
          </section>
        ) : null}

        {Object.keys(vitals).length > 0 ? (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Vitální funkce</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.entries(vitals).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-slate-50 px-3 py-2">
                  <dt className="text-xs text-slate-500">{key}</dt>
                  <dd className="font-medium text-[#021d33]">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {scenario.history ? (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Anamnéza</p>
            <p className="mt-2 text-sm text-slate-700">{scenario.history}</p>
          </section>
        ) : null}

        <SimulationPlayer scenario={scenario} simulationId={simulation.id} />

        {scenario.steps?.length ? (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Referenční postup</p>
            <ol className="mt-3 space-y-3">
              {scenario.steps.map((step, i) => (
                <li key={i} className="rounded-lg border border-slate-100 p-3">
                  <p className="font-medium text-[#021d33]">{step.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </>
  );
}
