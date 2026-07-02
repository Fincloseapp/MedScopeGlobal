import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { StudyCollabForm } from "@/components/forms/study-collab-form";

export const metadata: Metadata = {
  title: "Přidat studijní spolupráci",
};

export default function StudiePridatPage() {
  return (
    <ModulePageShell eyebrow="Studie" title="Přidat nabídku spolupráce" description="Pro výzkumné organizace a sponzory studií.">
      <StudyCollabForm />
    </ModulePageShell>
  );
}
