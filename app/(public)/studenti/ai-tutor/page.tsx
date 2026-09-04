import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, CheckCircle2 } from "lucide-react";
import {
  StudentAtelierShell,
  atelierGhostLink,
  atelierPrimaryLink,
} from "@/components/studenti/student-atelier-shell";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
    title: "AI tutor — MedScope pro studenty",
    description:
      "Studentský AI asistent na vysvětlení látky, opakování a přípravu. Doplněk k materiálům a kurzům — ne náhrada přednášek ani garance přijetí.",
    path: "/studenti/ai-tutor",
  });
}

const USE_CASES = [
  "Vysvětlení pojmu vlastními slovy (např. homeostáza, acidobazická rovnováha)",
  "Kontrolní otázky před testem nebo self-testem přijímaček",
  "Doplnění po lekci Academy — když něco v slidu nebylo jasné",
  "Rychlá orientace v tématu před čtením delšího materiálu",
] as const;

const RELATED = [
  {
    href: "/studenti/materialy",
    title: "Studijní materiály",
    body: "Nejdřív podklad, pak doptání u AI.",
  },
  {
    href: "/academy/courses?category=prijimacky",
    title: "Přípravné kurzy",
    body: "Strukturované lekce — AI tutor je doplněk.",
  },
  {
    href: "/studenti/testy",
    title: "Testy a procvičení",
    body: "Ověření, že látku opravdu umíte.",
  },
] as const;

export default function StudentiAiTutorPage() {
  return (
    <StudentAtelierShell
      current="/studenti/ai-tutor"
      kicker="Ateliér · AI tutor"
      title="AI tutor"
      lead="Studentský asistent na vysvětlení látky a tipy k opakování. Je to doplněk k materiálům a kurzům — ne náhrada přednášek, skript ani garance výsledku u přijímaček."
      actions={
        <>
          <Link href="/ai-asistent/student" className={atelierPrimaryLink()}>
            Spustit AI tutor
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/predplatne#student" className={atelierGhostLink()}>
            89 Kč první měsíc
          </Link>
        </>
      }
    >
      <div className="mb-6 flex items-center gap-2 text-sm text-[#5c564c]">
        <Brain className="h-4 w-4 text-[#8a6d32]" aria-hidden />
        <span>Pro uchazeče i studenty LF — nejlepší po krátké lekci nebo materiálu</span>
      </div>

      <section className="rounded-2xl border border-[#1b1712]/12 bg-white/80 p-6">
        <h2 className="font-display text-xl font-semibold text-[#1b1712]">Kdy to dává smysl</h2>
        <ul className="mt-4 space-y-3">
          {USE_CASES.map((line) => (
            <li key={line} className="flex items-start gap-2 text-sm text-[#1b1712]/80">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6d32]" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Link href="/ai-asistent/student" className={atelierPrimaryLink()}>
            Zeptej se AI
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-[#1b1712]">Související nástroje</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {RELATED.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-[#1b1712]/12 bg-white/80 p-4 transition hover:border-[#8a6d32]/50"
            >
              <p className="font-medium text-[#1b1712]">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#5c564c]">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>
    </StudentAtelierShell>
  );
}
