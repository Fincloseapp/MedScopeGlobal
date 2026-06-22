import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ModuleAiAssistant } from "@/components/v4c/module-ai-assistant";
import { V24AiMedicalHub } from "@/components/v24/ai-medical-hub";

export const metadata: Metadata = {
  title: "AI Medical Intelligence",
  description: "Klinické uvažování, diferenciální diagnostika a studijní asistence — MedScopeGlobal.",
};

export default function AiMedicalHubPage() {
  return (
    <>
      <V24AiMedicalHub />
      <ModulePageShell
        eyebrow="AI Medical"
        title="AI Medical Assistant"
        description="Odborné shrnutí studií, guidelines a klinických témat s citacemi zdrojů."
        showBrandLogo={false}
      >
        <div className="mb-6 flex flex-wrap gap-2 text-sm">
          <Link href="/ai/studie" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            AI Studie
          </Link>
          <Link href="/ai/klinicke-uvazovani" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Klinické uvažování
          </Link>
          <Link href="/ai/diferencialni-diagnostika" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Diferenciální diagnostika
          </Link>
          <Link href="/ai/lecebny-plan" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Léčebný plán
          </Link>
        </div>
        <ModuleAiAssistant
          module="odborne"
          placeholder="Zeptejte se na klinické téma, studii nebo guideline…"
        />
      </ModulePageShell>
    </>
  );
}
