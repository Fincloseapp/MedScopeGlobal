import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { IntelligenceConsole } from "@/components/ai-medical/intelligence-console";

export const metadata: Metadata = {
  title: "AI asistent pro legislativu",
};

export default function AiMedicalLegislativaPage() {
  return (
    <ModulePageShell
      eyebrow="AI Medical Intelligence"
      title="AI asistent pro legislativu"
      description="MZČR, SÚKL, ÚZIS, EU — filtrace podle kategorie legislativy."
    >
      <Link href="/ai-medical" className="text-sm text-[#005B96] mb-4 inline-block">
        ← Všechny asistenti
      </Link>
      <IntelligenceConsole defaultAssistant="legislativa" />
    </ModulePageShell>
  );
}
