import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { DoiLookupTool } from "@/components/v5plus/lookup-tool";

export const metadata: Metadata = { title: "DOI — extrakce a validace" };

export default function OdborneDoiPage() {
  return (
    <ModulePageShell
      eyebrow="V5+ Evidence"
      title="DOI extrakce"
      description="Validace DOI, normalizace a stažení PubMed metadat do medical_sources."
    >
      <Link href="/odborne" className="text-sm text-[#005B96] mb-6 inline-block">
        ← Odborné texty
      </Link>
      <DoiLookupTool />
    </ModulePageShell>
  );
}
