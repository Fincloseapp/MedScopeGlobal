import Link from "next/link";
import { Brain, Stethoscope, GitBranch, ClipboardList, GraduationCap } from "lucide-react";
import { V24_AI_MEDICAL } from "@/lib/v24/homepage";
import { Button } from "@/components/ui/button";

const ICONS = {
  assistant: Brain,
  reasoning: Stethoscope,
  ddx: GitBranch,
  treatment: ClipboardList,
  study: GraduationCap,
} as const;

export function V24AiMedicalHub() {
  return (
    <section
      className="border-y border-slate-200 bg-gradient-to-b from-[#f0f7fc] to-white"
      aria-labelledby="ai-medical-hub-title"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            AI Medical
          </p>
          <h2
            id="ai-medical-hub-title"
            className="mt-2 font-display text-3xl font-semibold text-[#021d33] sm:text-4xl"
          >
            {V24_AI_MEDICAL.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600">{V24_AI_MEDICAL.subtitle}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {V24_AI_MEDICAL.features.map((f) => {
            const Icon = ICONS[f.icon as keyof typeof ICONS] ?? Brain;
            return (
              <Link
                key={f.id}
                href={f.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-200 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[#005B96] transition group-hover:bg-[#005B96] group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-[#021d33]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full">
            <Link href="/ai">Spustit AI Medical</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/kvizy">Kvízy a studijní hry</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
