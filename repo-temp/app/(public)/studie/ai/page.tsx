import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ModuleAiAssistant } from "@/components/v4c/module-ai-assistant";

export const metadata: Metadata = { title: "AI — Studie" };

export default function StudieAiPage() {
  return (
    <ModulePageShell eyebrow="AI" title="AI asistent — studie" description="Vyhledávání, shrnutí a doporučení revmatologických studií.">
      <ModuleAiAssistant module="studie" placeholder="Např.: Shrň studie o RA z PubMed za poslední měsíc." />
    </ModulePageShell>
  );
}
