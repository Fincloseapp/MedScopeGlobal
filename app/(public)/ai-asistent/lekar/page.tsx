import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { IntelligenceConsole } from "@/components/ai-medical/intelligence-console";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Klinický AI pro lékaře | MedScopeGlobal",
    description: "Guidelines, diferenciální diagnostika a studie pro lékaře v praxi.",
    path: "/ai-asistent/lekar",
  });
}

export default function AiAsistentLekarPage() {
  return (
    <ModulePageShell
      eyebrow="AI asistent · Lékaři"
      title="Klinický AI asistent"
      description="Evidence-based odpovědi pro lékaře — guidelines, studie, léčebné algoritmy."
    >
      <Link href="/ai-asistent" className="mb-4 inline-block text-sm text-[#005B96]">
        ← Všechny asistenti
      </Link>
      <IntelligenceConsole defaultAssistant="doctor" title="Klinický AI asistent" />
    </ModulePageShell>
  );
}
