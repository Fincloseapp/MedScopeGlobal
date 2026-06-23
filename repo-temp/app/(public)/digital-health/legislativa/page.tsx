import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";

export default function DhLegislativaPage() {
  return (
    <ModulePageShell eyebrow="Digital Health" title="Legislativa digital health" description="EU AI Act, SÚKL regulace SW jako zdravotnický prostředek.">
      <p className="text-sm text-slate-600">
        Přehled regulace najdete v modulu{" "}
        <Link href="/legislativa" className="text-[#005B96] font-semibold">
          Legislativa
        </Link>{" "}
        a v sekcích{" "}
        <Link href="/legislativa/metodiky" className="text-[#005B96]">
          metodiky
        </Link>
        .
      </p>
    </ModulePageShell>
  );
}
