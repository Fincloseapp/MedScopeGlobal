import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ModuleAiAssistant } from "@/components/v4c/module-ai-assistant";

export const metadata: Metadata = {
  title: "AI Differential Diagnosis",
};

export default function AiDdxPage() {
  return (
    <ModulePageShell
      eyebrow="AI Medical"
      title="AI Differential Diagnosis"
      description="Diferenciální diagnostika s red flags a pravděpodobnostním rámcem."
    >
      <Link href="/ai" className="mb-4 inline-block text-sm text-[#005B96]">
        ← AI Medical Hub
      </Link>
      <ModuleAiAssistant
        module="odborne"
        placeholder="Uveďte hlavní symptom, kontext a dosavadní vyšetření pro DDx…"
      />
    </ModulePageShell>
  );
}
