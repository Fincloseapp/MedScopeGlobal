import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { IntelligenceConsole } from "@/components/ai-medical/intelligence-console";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Clinical Assistant for Doctors | MedScopeGlobal",
  description: "Klinický AI asistent pro guidelines, diferenciální diagnostiku a studie.",
  path: "/ai-asistent/lekar",
});

export default function AiAsistentLekarPage() {
  return (
    <ModulePageShell
      eyebrow="Lékaři"
      title="Clinical Assistant for Doctors"
      description="Klinický AI pro guidelines, diferenciální diagnostiku a evidence-based odpovědi — doplněk, ne náhrada klinického úsudku."
      ctaHref="/odborne"
      ctaLabel="Odborná sekce"
    >
      <Link href="/ai-asistent" className="mb-4 inline-block text-sm text-[#005B96] hover:underline">
        ← Všechny asistenti
      </Link>

      <IntelligenceConsole simplified defaultAssistant="doctor" title="Clinical Assistant for Doctors" />
    </ModulePageShell>
  );
}
