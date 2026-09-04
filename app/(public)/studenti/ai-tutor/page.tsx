import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <>
      <section className="border-b border-[#d9e8f4] bg-[radial-gradient(circle_at_top,_rgba(0,91,150,0.1),transparent_35%),linear-gradient(180deg,#fff_0%,#f8fbff_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            MedScope · Studenti
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-[#021d33]">
            AI tutor
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Studentský asistent na vysvětlení látky a tipy k opakování. Je to doplněk k materiálům a
            kurzům — ne náhrada přednášek, skript ani garance výsledku u přijímaček.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-[#005B96]">
              <Link href="/ai-asistent/student">
                Spustit AI tutor
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/predplatne#student">
                89 Kč první měsíc
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav className="mb-8 text-sm text-muted-foreground" aria-label="Drobečková navigace">
          <Link href="/" className="hover:text-foreground">
            Domů
          </Link>
          <span className="mx-2">/</span>
          <Link href="/studenti" className="hover:text-foreground">
            Studenti
          </Link>
          <span className="mx-2">/</span>
          <span>AI tutor</span>
        </nav>

        <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <Brain className="h-4 w-4 text-[#005B96]" aria-hidden />
          <span>Pro uchazeče i studenty LF — nejlepší po krátké lekci nebo materiálu</span>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-xl font-semibold text-[#021d33]">Kdy to dává smysl</h2>
          <ul className="mt-4 space-y-3">
            {USE_CASES.map((line) => (
              <li key={line} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#005B96]" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Button asChild className="rounded-full bg-[#005B96]">
              <Link href="/ai-asistent/student">
                Zeptej se AI
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-[#021d33]">Související nástroje</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {RELATED.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#005B96]/40"
              >
                <p className="font-medium text-[#021d33]">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.body}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
