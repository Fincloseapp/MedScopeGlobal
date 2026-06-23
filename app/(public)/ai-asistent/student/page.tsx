import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { IntelligenceConsole } from "@/components/ai-medical/intelligence-console";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Student Medical Tutor | MedScopeGlobal",
  description: "Studentský AI tutor pro anatomii, farmakologii a přípravu na zkoušky LF.",
  path: "/ai-asistent/student",
});

export default function AiAsistentStudentPage() {
  return (
    <ModulePageShell
      eyebrow="Studenti medicíny"
      title="Student Medical Tutor"
      description="AI tutor pro anatomii, farmakologii, fyziologii a přípravu na přijímačky a zkoušky."
      ctaHref="/medicina/studium"
      ctaLabel="Studijní materiály"
    >
      <Link href="/ai-asistent" className="mb-4 inline-block text-sm text-[#005B96] hover:underline">
        ← Všechny asistenti
      </Link>

      <IntelligenceConsole simplified defaultAssistant="univerzity" title="Student Medical Tutor" />
    </ModulePageShell>
  );
}
