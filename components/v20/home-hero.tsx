import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function V20HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/80">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-18">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
            Český odborný medicínský portál
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-[#021d33] sm:text-5xl">
            Medicína s důrazem na evidenci a praxi
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            MedScopeGlobal propojuje klinickou praxi, výzkum a vzdělávání. Obsah je v češtině,
            strukturovaný podle odborných registrů a připravený pro lékaře, studenty i pacienty.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-5">
              <Link href="/articles">
                Prohlédnout články
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link href="/odborne/briefy">Odborné briefy</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-full">
              <Link href="/studie" prefetch>Studie</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2 text-xs text-slate-600">
            {[
              "Odborná redakce",
              "Citace u každého článku",
              "NZIP deep linking",
              "GDPR-ready",
            ].map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200/80"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
