import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ModuleAiAssistant } from "@/components/v4c/module-ai-assistant";

export const metadata: Metadata = {
  title: "AI Clinical Reasoning",
};

export default function AiClinicalReasoningPage() {
  return (
    <ModulePageShell
      eyebrow="AI Medical"
      title="AI Clinical Reasoning"
      description="Strukturované klinické uvažování — anamnéza, DDx, další kroky."
    >
      <Link href="/ai" className="mb-4 inline-block text-sm text-[#005B96]">
        ← AI Medical Hub
      </Link>
      <ModuleAiAssistant
        module="odborne"
        placeholder="Popište klinický případ — anamnéza, nález, laboratorní výsledky…"
      />
    </ModulePageShell>
  );
}
