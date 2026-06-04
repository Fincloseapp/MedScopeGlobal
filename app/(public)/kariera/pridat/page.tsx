import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { JobPostForm } from "@/components/forms/job-post-form";

export const metadata: Metadata = {
  title: "Přidat pracovní pozici",
  description: "Formulář pro zaměstnavatele — publikace po schválení.",
};

export default function KarieraPridatPage() {
  return (
    <ModulePageShell
      eyebrow="Kariéra"
      title="Přidat nabídku práce"
      description="Nabídka bude po kontrole publikována v sekci Kariéra."
    >
      <JobPostForm />
    </ModulePageShell>
  );
}
