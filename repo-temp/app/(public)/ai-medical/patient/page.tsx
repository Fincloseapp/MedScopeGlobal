import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { IntelligenceConsole } from "@/components/ai-medical/intelligence-console";

export const metadata: Metadata = {
  title: "AI asistent pro pacienty",
};

export default function AiMedicalPatientPage() {
  return (
    <ModulePageShell
      eyebrow="AI Medical Intelligence"
      title="AI asistent pro pacienty"
      description="Srozumitelná shrnutí, doporučení a přehledy — vždy s konzultací lékaře."
    >
      <Link href="/ai-medical" className="text-sm text-[#005B96] mb-4 inline-block">
        ← Všechny asistenti
      </Link>
      <IntelligenceConsole defaultAssistant="patient" />
    </ModulePageShell>
  );
}
