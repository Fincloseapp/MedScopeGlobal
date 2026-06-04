import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ModuleAiAssistant } from "@/components/v4c/module-ai-assistant";

export default function Page() {
  return (
    <ModulePageShell eyebrow="AI" title="AI Legislativa" description="Přehledy regulace a doporučení.">
      <ModuleAiAssistant module="legislativa" />
    </ModulePageShell>
  );
}
