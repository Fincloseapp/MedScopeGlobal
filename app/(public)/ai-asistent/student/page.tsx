import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { IntelligenceConsole } from "@/components/ai-medical/intelligence-console";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "AI tutor pro studenty | MedScopeGlobal",
    description: "Anatomie, farmakologie a příprava na zkoušky s AI tutorem.",
    path: "/ai-asistent/student",
  });
}

export default function AiAsistentStudentPage() {
  return (
    <ModulePageShell
      eyebrow="MedScope v27 · Studenti"
      title="AI tutor"
      description="Studijní pomocník pro studenty medicíny — anatomie, farmakologie, modelové otázky."
    >
      <Link href="/ai-asistent" className="mb-4 inline-block text-sm text-[#005B96]">
        ← Všechny asistenti
      </Link>
      <IntelligenceConsole defaultAssistant="univerzity" title="Studentský AI tutor" />
    </ModulePageShell>
  );
}
