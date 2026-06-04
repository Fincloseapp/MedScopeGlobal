import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ModuleAiAssistant } from "@/components/v4c/module-ai-assistant";

export const metadata: Metadata = {
  title: "AI — odborné texty",
};

export default function OdborneAiPage() {
  return (
    <ModulePageShell
      eyebrow="Odborné texty"
      title="AI asistent"
      description="Dotazy k odborným textům, kategorizaci, kvalitě a překladům do češtiny."
    >
      <Link href="/odborne" className="text-sm text-[#005B96] mb-4 inline-block">
        ← Odborné texty
      </Link>
      <ModuleAiAssistant
        module="odborne"
        placeholder="Např.: Shrň poslední RCT v revmatologii z LF UK…"
      />
    </ModulePageShell>
  );
}
