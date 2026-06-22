import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { V23_EDITORIAL_PILLARS, V23_VALUE_PROPOSITION } from "@/lib/v23/homepage";
import { V23_HERO_IMAGE } from "@/lib/v23/images";

export function V23HomeHero() {
  const vp = V23_VALUE_PROPOSITION;

  return (
    <section
      className="relative overflow-hidden border-b border-slate-200 bg-[#021d33] text-white"
      aria-labelledby="home-hero-title"
    >
      <div className="absolute inset-0">
        <Image
          src={V23_HERO_IMAGE}
          alt="Moderní zdravotnická péče a medicínský výzkum"
          fill
          className="object-cover opacity-35"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#021d33] via-[#021d33]/92 to-[#021d33]/75" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-200 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {vp.eyebrow}
            </p>
            <h1
              id="home-hero-title"
              className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem]"
            >
              {vp.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
              Redakčně kurátorované studie, guidelines a vzdělávání v češtině — pro lékaře v praxi,
              studenty LF i laiky, kteří chtějí spolehlivé zdravotní informace.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-white px-6 text-[#021d33] hover:bg-sky-50">
                <Link href="/predplatne?trial=1" prefetch>
                  Vyzkoušet 14 dní zdarma
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" className="rounded-full bg-[#005B96] px-6 text-white hover:bg-[#004a7a]">
                <Link href="/predplatne" prefetch>
                  Předplatit
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/studie" prefetch>
                  Nejnovější studie
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/newsletter" prefetch>
                  Odborný newsletter
                </Link>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-2">
              {["2 800+ studentů", "500+ článků", "PubMed · SÚKL · EMA", "14 dní zdarma"].map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-sky-100 ring-1 ring-white/15"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {V23_EDITORIAL_PILLARS.map((pillar) => (
              <Link
                key={pillar.href}
                href={pillar.href}
                prefetch
                className="group rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur transition hover:border-sky-300/40 hover:bg-white/15"
              >
                <p className="font-semibold text-white group-hover:text-sky-100">{pillar.label}</p>
                <p className="mt-1 text-sm text-white/70">{pillar.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
