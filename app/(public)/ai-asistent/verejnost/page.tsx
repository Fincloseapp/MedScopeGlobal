import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { IntelligenceConsole } from "@/components/ai-medical/intelligence-console";
import { PublicTrustDisclaimer } from "@/components/verejnost/public-trust-disclaimer";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Public Health Assistant | MedScopeGlobal",
  description: "Zeptejte se AI o prevenci, výživě, spánku a životním stylu — srozumitelně, bez odborného žargonu.",
  path: "/ai-asistent/verejnost",
});

const EXAMPLE_QUESTIONS = [
  "Jak zlepšit kvalitu spánku?",
  "Co znamenají běžné příznaky chřipky?",
  "Jaké jsou základy zdravé výživy?",
];

export default function AiAsistentVerejnostPage() {
  return (
    <ModulePageShell
      eyebrow="Veřejné zdraví"
      title="Public Health Assistant"
      description="Napište dotaz o prevenci, symptomech nebo životním stylu. Odpovědi jsou vzdělávací a nenahrazují návštěvu lékaře."
      ctaHref="/pro-koho/laik-student"
      ctaLabel="Obsah pro veřejnost"
    >
      <Link href="/ai-asistent" className="mb-4 inline-block text-sm text-[#005B96] hover:underline">
        ← Všechny asistenti
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

      <IntelligenceConsole simplified defaultAssistant="patient" title="Public Health Assistant" />
    </ModulePageShell>
  );
}
