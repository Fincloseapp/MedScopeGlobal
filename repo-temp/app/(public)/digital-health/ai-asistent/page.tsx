import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ModuleAiAssistant } from "@/components/v4c/module-ai-assistant";

export default function Page() {
  return (
    <ModulePageShell eyebrow="AI" title="AI Digital Health" description="Shrnutí a doporučení v oblasti digital health.">
      <ModuleAiAssistant module="digital-health" />
    </ModulePageShell>
  );
}
