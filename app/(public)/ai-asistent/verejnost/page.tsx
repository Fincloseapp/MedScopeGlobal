import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { IntelligenceConsole } from "@/components/ai-medical/intelligence-console";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "AI asistent pro veřejnost | MedScopeGlobal",
    description: "Zeptejte se AI o prevenci, výživě, spánku a životním stylu.",
    path: "/ai-asistent/verejnost",
  });
}

export default function AiAsistentVerejnostPage() {
  return (
    <ModulePageShell
      eyebrow="MedScope v27 · Veřejnost"
      title="Zeptej se AI"
      description="Srozumitelné odpovědi o prevenci, symptomech a životním stylu. Nenahrazuje lékařskou péči."
    >
      <Link href="/ai-asistent" className="mb-4 inline-block text-sm text-[#005B96]">
        ← Všechny asistenti
      </Link>
      <IntelligenceConsole defaultAssistant="patient" title="Veřejný AI asistent" />
    </ModulePageShell>
  );
}
