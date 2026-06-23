import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ModuleAiAssistant } from "@/components/v4c/module-ai-assistant";

export const metadata: Metadata = {
  title: "AI Treatment Planner",
};

export default function AiTreatmentPlannerPage() {
  return (
    <ModulePageShell
      eyebrow="AI Medical"
      title="AI Treatment Planner"
      description="Léčebný plán v edukativním režimu — bez individuálního dávkování."
    >
      <Link href="/ai" className="mb-4 inline-block text-sm text-[#005B96]">
        ← AI Medical Hub
      </Link>
      <ModuleAiAssistant
        module="odborne"
        placeholder="Diagnóza, komorbidity a cíle léčby (edukativní přehled, ne individuální preskripce)…"
      />
    </ModulePageShell>
  );
}
