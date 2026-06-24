import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { IntelligenceConsole } from "@/components/ai-medical/intelligence-console";
import { PublicTrustDisclaimer } from "@/components/verejnost/public-trust-disclaimer";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "AI asistent pro veřejnost | MedScopeGlobal",
    description: "Zeptejte se AI o prevenci, výživě, spánku a životním stylu — srozumitelně, bez odborného žargonu.",
    path: "/ai-asistent/verejnost",
  });
}

const EXAMPLE_QUESTIONS = [
  "Jak zlepšit kvalitu spánku?",
  "Co znamenají běžné příznaky chřipky?",
  "Jaké jsou základy zdravé výživy?",
];

export default function AiAsistentVerejnostPage() {
  return (
    <ModulePageShell
      eyebrow="Veřejné zdraví"
      title="Zeptej se AI — srozumitelné odpovědi o zdraví"
      description="Napište dotaz o prevenci, symptomech nebo životním stylu. Odpovědi jsou vzdělávací a nenahrazují návštěvu lékaře."
      ctaHref="/verejnost/temata"
      ctaLabel="Najdi svůj problém"
    >
      <Link href="/verejnost" className="mb-4 inline-block text-sm text-[#005B96] hover:underline">
        ← Zpět na veřejnou sekci
      </Link>

      <PublicTrustDisclaimer className="mb-6" />

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-[#021d33]">Příklady dotazů</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {EXAMPLE_QUESTIONS.map((q) => (
            <li key={q}>· {q}</li>
          ))}
        </ul>
      </div>

      <IntelligenceConsole defaultAssistant="patient" simplified title="Veřejný AI asistent" />
    </ModulePageShell>
  );
}
