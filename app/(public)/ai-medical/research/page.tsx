import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { IntelligenceConsole } from "@/components/ai-medical/intelligence-console";

export const metadata: Metadata = {
  title: "AI asistent pro výzkum",
};

export default function AiMedicalResearchPage() {
  return (
    <ModulePageShell
      eyebrow="AI Medical Intelligence"
      title="AI asistent pro výzkum"
      description="Meta-analýzy, RCT, evidence level, metodologie a výzkumné přehledy."
    >
      <Link href="/ai-medical" className="text-sm text-[#005B96] mb-4 inline-block">
        ← Všechny asistenti
      </Link>
      <IntelligenceConsole defaultAssistant="research" />
    </ModulePageShell>
  );
}
