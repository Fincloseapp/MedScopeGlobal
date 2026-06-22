import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { AdRequestForm } from "@/components/forms/ad-request-form";

export const metadata: Metadata = {
  title: "Formulář inzerce",
  description: "Objednávka reklamy s automatickým naceněním a GDPR souhlasem.",
};

export default function InzerceFormularPage() {
  return (
    <ModulePageShell
      eyebrow="Formulář"
      title="Objednávka reklamy"
      description="Po odeslání obdržíte potvrzení na info@medscopeglobal.com. Po schválení administrátorem dostanete platební odkaz Stripe."
    >
      <AdRequestForm />
    </ModulePageShell>
  );
}
