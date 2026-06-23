import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ModuleAiAssistant } from "@/components/v4c/module-ai-assistant";

export default function Page() {
  return (
    <ModulePageShell eyebrow="AI" title="AI Newsletter" description="Generování shrnutí, layoutu a PDF outline.">
      <ModuleAiAssistant module="newsletter" placeholder="Např.: Vytvoř outline newsletteru za květen 2026." />
    </ModulePageShell>
  );
}
