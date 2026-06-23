import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { CongressForm } from "@/components/forms/congress-form";

export const metadata: Metadata = {
  title: "Přidat kongres",
  description: "AI extrahuje datum, místo, cenu a registrační odkaz ze zdrojové URL.",
};

export default function KongresyPridatPage() {
  return (
    <ModulePageShell
      eyebrow="Kongresy"
      title="Přidat kongres nebo školení"
      description="Automatické vyhledávání v českých a evropských zdrojích (univerzity, společnosti, databáze) při zadání URL — AI doplní metadata."
    >
      <CongressForm />
    </ModulePageShell>
  );
}
