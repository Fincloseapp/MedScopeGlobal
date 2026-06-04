import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getMedicalAiTexts } from "@/lib/queries/v4d/medical-ai";

export const metadata: Metadata = {
  title: "Nejnovější odborné texty",
};

export default async function OdborneNejnovejsiPage() {
  const texts = await getMedicalAiTexts({ limit: 24 });

  return (
    <ModulePageShell
      eyebrow="Odborné texty"
      title="Nejnovější"
      description="Poslední AI zpracované odborné texty s kontrolou kvality a překladem do češtiny."
    >
      <Link href="/odborne" className="text-sm text-[#005B96] mb-4 inline-block">
        ← Odborné texty
      </Link>
      <div className="grid gap-4 sm:grid-cols-2">
        {texts.map((t) => (
          <V4cContentCard
            key={t.id}
            href={`/odborne/${t.id}`}
            title={t.title}
            meta={[t.source_name, new Date(t.created_at).toLocaleDateString("cs-CZ")]
              .filter(Boolean)
              .join(" · ")}
            summary={t.summary_clinician}
            badge={t.specialty ?? "medicína"}
          />
        ))}
      </div>
    </ModulePageShell>
  );
}
