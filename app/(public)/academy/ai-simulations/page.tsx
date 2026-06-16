import { AcademyPageHeader } from "@/components/academy/page-header";
import { listClinicalSimulations, listAiScenarios } from "@/lib/academy/db";

export const revalidate = 120;

export default async function AcademySimulationsPage() {
  const [simulations, scenarios] = await Promise.all([
    listClinicalSimulations(20),
    listAiScenarios(20),
  ]);

  return (
    <>
      <AcademyPageHeader
        eyebrow="AI simulace"
        title="Klinické simulace"
        description="Interaktivní klinické scénáře s AI zpětnou vazbou."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-8">
        <section>
          <h2 className="font-display text-lg font-semibold text-[#021d33]">Simulace</h2>
          {simulations.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {simulations.map((s) => (
                <li key={s.id} className="rounded-xl border border-[#cfe1f3] bg-white px-5 py-4">
                  {s.title} — {s.difficulty}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Simulace budou brzy k dispozici.</p>
          )}
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold text-[#021d33]">AI scénáře</h2>
          {scenarios.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {scenarios.map((s) => (
                <li key={s.id} className="rounded-xl border border-[#cfe1f3] bg-white px-5 py-4">
                  {s.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">AI scénáře ve fázi 2.</p>
          )}
        </section>
      </div>
    </>
  );
}
