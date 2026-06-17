import Link from "next/link";
import { AcademyPageHeader } from "@/components/academy/page-header";
import { listClinicalSimulations } from "@/lib/academy/db";

export const revalidate = 120;

export default async function AcademySimulationsPage() {
  const simulations = await listClinicalSimulations();

  return (
    <>
      <AcademyPageHeader
        eyebrow="AI simulace"
        title="Klinické simulace"
        description="Interaktivní kazuistiky a triážové scénáře pro studenty i lékaře."
      />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {simulations.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {simulations.map((sim) => (
              <article key={sim.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="font-display text-lg font-semibold text-[#021d33]">{sim.title}</h2>
                <p className="mt-1 text-sm text-slate-600">Obtížnost: {sim.difficulty}</p>
                <Link href={`/academy/ai-simulations/${sim.slug}`} className="mt-3 inline-block text-sm text-[#005B96] hover:underline">
                  Spustit simulaci →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Simulace se generují AI pipeline — brzy k dispozici.
          </p>
        )}
      </div>
    </>
  );
}
