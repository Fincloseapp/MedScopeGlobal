import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ModuleAiAssistant } from "@/components/v4c/module-ai-assistant";

export default function Page() {
  return (
    <ModulePageShell eyebrow="AI" title="AI novinky" description="Vyhledávání a shrnutí univerzitních novinek.">
      <ModuleAiAssistant module="novinky" />
    </ModulePageShell>
  );
}
