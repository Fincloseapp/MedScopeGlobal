import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ModuleAiAssistant } from "@/components/v4c/module-ai-assistant";

export default function Page() {
  return (
    <ModulePageShell eyebrow="AI" title="AI Léky" description="Novinky o lécích, EMA/FDA/SÚKL.">
      <ModuleAiAssistant module="leky" />
    </ModulePageShell>
  );
}
