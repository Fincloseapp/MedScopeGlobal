import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getMedicalAiCategories } from "@/lib/queries/v4d/medical-ai";

export const metadata: Metadata = {
  title: "Kategorie — odborné texty",
};

const TYPE_LABELS: Record<string, string> = {
  diagnosis: "Diagnózy",
  study_type: "Typ studie",
  evidence_level: "Úroveň důkazů",
  clinical_impact: "Klinický dopad",
  practice: "Doporučení pro praxi",
  specialty: "Obory",
  language: "Jazyky",
};

export default async function OdborneKategoriePage() {
  const categories = await getMedicalAiCategories();
  const grouped = categories.reduce<Record<string, typeof categories>>(
    (acc, c) => {
      (acc[c.category_type] ??= []).push(c);
      return acc;
    },
    {}
  );

  return (
    <ModulePageShell
      eyebrow="Odborné texty"
      title="Kategorie"
      description="Automatická AI kategorizace: diagnóza, typ studie, úroveň důkazů, klinický dopad a doporučení."
    >
      <Link href="/odborne" className="text-sm text-[#005B96] mb-6 inline-block">
        ← Odborné texty
      </Link>
      <div className="space-y-8">
        {Object.entries(grouped).map(([type, items]) => (
          <section key={type}>
            <h2 className="font-display text-lg font-bold text-[#021d33]">
              {TYPE_LABELS[type] ?? type}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {items.map((c) => (
                <li key={c.id}>
                  <span className="rounded-full border border-[#8dc4ea] bg-white px-3 py-1 text-sm text-[#005B96]">
                    {c.label_cs}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </ModulePageShell>
  );
}
