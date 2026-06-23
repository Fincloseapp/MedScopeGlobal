import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { IntelligenceConsole } from "@/components/ai-medical/intelligence-console";
import {
  AI_MEDICAL_ASSISTANTS,
  ASSISTANT_LABELS_CS,
  ASSISTANT_ROUTES,
} from "@/lib/ai-medical/types";

export const metadata: Metadata = {
  title: "AI Medical Intelligence",
  description:
    "Sedm specializovaných AI asistentů — lékař, pacient, výzkum, legislativa, léky, studie, univerzity.",
};

export default function AiMedicalPage() {
  return (
    <ModulePageShell
      eyebrow="AI Medical Intelligence"
      title="AI Medical Intelligence"
      description="Vyhledávání v Supabase, generování odborných textů přes Groq (V5, zdarma). Překlady CZ/SK/EN. Engine: Groq → Gemini → OpenAI."
    >
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {AI_MEDICAL_ASSISTANTS.map((a) => (
          <Link
            key={a}
            href={ASSISTANT_ROUTES[a]}
            className="rounded-xl border border-[#cfe1f3] bg-white p-4 hover:shadow-md transition-shadow"
          >
            <p className="font-semibold text-[#021d33] text-sm">
              {ASSISTANT_LABELS_CS[a]}
            </p>
          </Link>
        ))}
      </div>
      <IntelligenceConsole defaultAssistant="doctor" />
    </ModulePageShell>
  );
}
