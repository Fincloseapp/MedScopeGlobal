import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { PubMedLookupTool, RegulatoryLookupTool } from "@/components/v5plus/lookup-tool";

export const metadata: Metadata = { title: "PubMed / Regulatory fetch" };

export default function OdbornePubmedPage() {
  return (
    <ModulePageShell
      eyebrow="V5+ Evidence"
      title="PubMed & regulace"
      description="Stažení metadat z NCBI a regulatory informací (FDA openFDA, EMA, SÚKL)."
    >
      <Link href="/odborne" className="text-sm text-[#005B96] mb-6 inline-block">
        ← Odborné texty
      </Link>
      <div className="space-y-8">
        <PubMedLookupTool />
        <RegulatoryLookupTool />
      </div>
    </ModulePageShell>
  );
}
